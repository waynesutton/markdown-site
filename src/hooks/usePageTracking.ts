import { useEffect, useRef, useCallback } from "react";
import { useMutation } from "convex/react";
import { useLocation } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import siteConfig from "../config/siteConfig";

// Heartbeat interval: 45 seconds (with jitter added to prevent synchronized calls)
const HEARTBEAT_INTERVAL_MS = 45 * 1000;

// Minimum time between heartbeats to prevent write conflicts: 45 seconds (matches backend dedup window)
const HEARTBEAT_DEBOUNCE_MS = 45 * 1000;

// Jitter range: ±5 seconds to prevent synchronized heartbeats across tabs
const HEARTBEAT_JITTER_MS = 5 * 1000;

// Session ID key in localStorage
const SESSION_ID_KEY = "markdown_blog_session_id";

// BroadcastChannel name for cross-tab heartbeat coordination
const HEARTBEAT_CHANNEL_NAME = "markdown_sync_heartbeat";

// Geo data interface from Netlify edge function
interface GeoData {
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

/**
 * Generate a random session ID (UUID v4 format)
 */
function generateSessionId(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Get or create a persistent session ID
 */
function getSessionId(): string {
  if (typeof window === "undefined") {
    return generateSessionId();
  }

  let sessionId = localStorage.getItem(SESSION_ID_KEY);
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem(SESSION_ID_KEY, sessionId);
  }
  return sessionId;
}

/**
 * Determine page type from path
 */
function getPageType(path: string): string {
  if (path === "/" || path === "") {
    return "home";
  }
  if (path === "/stats") {
    return "stats";
  }
  // Could be a blog post or static page
  return "page";
}

/**
 * Hook to track page views and maintain active session presence
 * Fetches geo location from Netlify edge function for visitor map
 * Only tracks when statsPage.enabled is true in siteConfig
 * Uses BroadcastChannel to coordinate heartbeats across tabs (only leader tab sends)
 */
export function usePageTracking(): void {
  const location = useLocation();
  const recordPageView = useMutation(api.stats.recordPageView);
  const heartbeatMutation = useMutation(api.stats.heartbeat);

  // Check if stats tracking is enabled
  const isStatsEnabled = siteConfig.statsPage?.enabled ?? false;

  // Track if we've recorded view for current path
  const lastRecordedPath = useRef<string | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  // Track heartbeat state to prevent duplicate calls and write conflicts
  const isHeartbeatPending = useRef(false);
  const lastHeartbeatTime = useRef(0);
  const lastHeartbeatPath = useRef<string | null>(null);

  // Geo data ref (fetched once on mount)
  const geoDataRef = useRef<GeoData | null>(null);
  const geoFetchedRef = useRef(false);

  // Cross-tab coordination: only one tab sends heartbeats
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);
  const isLeaderTabRef = useRef(true);
  const tabIdRef = useRef<string>(Math.random().toString(36).substring(2, 9));

  // Initialize BroadcastChannel for cross-tab heartbeat coordination
  useEffect(() => {
    if (!isStatsEnabled) return;
    if (typeof window === "undefined") return;
    if (typeof BroadcastChannel === "undefined") return;

    const channel = new BroadcastChannel(HEARTBEAT_CHANNEL_NAME);
    broadcastChannelRef.current = channel;

    // Claim leadership with our tab ID and timestamp
    const claimLeadership = () => {
      channel.postMessage({ type: "claim", tabId: tabIdRef.current, timestamp: Date.now() });
    };

    // Announce presence immediately
    claimLeadership();

    // Handle messages from other tabs
    channel.onmessage = (event) => {
      const { type, tabId, timestamp } = event.data;

      if (type === "claim" && tabId !== tabIdRef.current) {
        // Another tab claimed leadership - yield if they're newer (higher timestamp wins ties)
        // This ensures deterministic leader election
        if (timestamp > Date.now() - 1000) {
          isLeaderTabRef.current = false;
        }
      }

      if (type === "heartbeat_sent" && tabId !== tabIdRef.current) {
        // Another tab sent a heartbeat - we don't need to send one
        lastHeartbeatTime.current = Date.now();
      }

      if (type === "close" && tabId !== tabIdRef.current) {
        // Another tab closed - we can try to become leader
        setTimeout(() => {
          isLeaderTabRef.current = true;
          claimLeadership();
        }, Math.random() * 500);
      }
    };

    // Announce when this tab closes so others can become leader
    const handleBeforeUnload = () => {
      channel.postMessage({ type: "close", tabId: tabIdRef.current });
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      channel.postMessage({ type: "close", tabId: tabIdRef.current });
      channel.close();
      broadcastChannelRef.current = null;
    };
  }, [isStatsEnabled]);

  // Initialize session ID and fetch geo data once on mount (only if stats enabled)
  useEffect(() => {
    if (!isStatsEnabled) return;

    sessionIdRef.current = getSessionId();

    // Fetch geo data once (skip if already fetched)
    if (!geoFetchedRef.current) {
      geoFetchedRef.current = true;

      // Check if running on localhost (edge functions don't work locally)
      const isLocalhost =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1";

      if (isLocalhost) {
        // Use mock geo data for localhost testing
        geoDataRef.current = {
          city: "San Francisco",
          country: "US",
          latitude: 37.7749,
          longitude: -122.4194,
        };
      } else {
        // Fetch real geo data from Netlify edge function in production
        fetch("/api/geo")
          .then((res) => res.json())
          .then((data: GeoData) => {
            if (data.latitude && data.longitude) {
              geoDataRef.current = data;
            }
          })
          .catch(() => {
            // Silently fail - geo data is optional
          });
      }
    }
  }, [isStatsEnabled]);

  // Debounced heartbeat function to prevent write conflicts
  const sendHeartbeat = useCallback(
    async (path: string) => {
      // Skip if stats disabled
      if (!isStatsEnabled) return;

      const sessionId = sessionIdRef.current;
      if (!sessionId) return;

      const now = Date.now();

      // Skip if heartbeat is already pending
      if (isHeartbeatPending.current) {
        return;
      }

      // Skip if not the leader tab (let other tab handle it)
      if (broadcastChannelRef.current && !isLeaderTabRef.current) {
        return;
      }

      // Skip if sent recently (debounce)
      if (now - lastHeartbeatTime.current < HEARTBEAT_DEBOUNCE_MS) {
        return;
      }

      isHeartbeatPending.current = true;
      lastHeartbeatTime.current = now;
      lastHeartbeatPath.current = path;

      try {
        const geo = geoDataRef.current;
        await heartbeatMutation({
          sessionId,
          currentPath: path,
          ...(geo?.city && { city: geo.city }),
          ...(geo?.country && { country: geo.country }),
          ...(geo?.latitude && { latitude: geo.latitude }),
          ...(geo?.longitude && { longitude: geo.longitude }),
        });

        // Notify other tabs that we sent a heartbeat
        broadcastChannelRef.current?.postMessage({
          type: "heartbeat_sent",
          tabId: tabIdRef.current,
        });
      } catch {
        // Silently fail - analytics shouldn't break the app
      } finally {
        isHeartbeatPending.current = false;
      }
    },
    [heartbeatMutation, isStatsEnabled]
  );

  // Record page view when path changes (only if stats enabled)
  useEffect(() => {
    if (!isStatsEnabled) return;

    const path = location.pathname;
    const sessionId = sessionIdRef.current;

    if (!sessionId) return;

    // Only record if path changed
    if (lastRecordedPath.current !== path) {
      lastRecordedPath.current = path;

      recordPageView({
        path,
        pageType: getPageType(path),
        sessionId,
      }).catch(() => {
        // Silently fail - analytics shouldn't break the app
      });
    }
  }, [location.pathname, recordPageView, isStatsEnabled]);

  // Send heartbeat on interval and on path change (only if stats enabled)
  useEffect(() => {
    if (!isStatsEnabled) return;

    const path = location.pathname;

    // Add random jitter to initial delay to prevent synchronized heartbeats across tabs
    const initialJitter = Math.random() * HEARTBEAT_JITTER_MS;

    // Send initial heartbeat after jitter delay
    const initialTimeoutId = setTimeout(() => {
      sendHeartbeat(path);
    }, initialJitter);

    // Recursive setTimeout for variable timing with jitter
    let timeoutId: ReturnType<typeof setTimeout>;
    const scheduleNextHeartbeat = () => {
      const jitter = (Math.random() - 0.5) * 2 * HEARTBEAT_JITTER_MS;
      const nextDelay = HEARTBEAT_INTERVAL_MS + jitter;
      timeoutId = setTimeout(() => {
        sendHeartbeat(path);
        scheduleNextHeartbeat();
      }, nextDelay);
    };

    // Start the heartbeat loop after initial heartbeat
    const loopTimeoutId = setTimeout(() => {
      scheduleNextHeartbeat();
    }, initialJitter + HEARTBEAT_INTERVAL_MS);

    return () => {
      clearTimeout(initialTimeoutId);
      clearTimeout(loopTimeoutId);
      clearTimeout(timeoutId);
    };
  }, [location.pathname, sendHeartbeat, isStatsEnabled]);
}
