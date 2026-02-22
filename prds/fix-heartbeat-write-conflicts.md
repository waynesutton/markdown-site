# Fix Heartbeat Write Conflicts

## Problem

Write conflicts occurring in `activeSessions` table from `stats:heartbeat` mutation. Conflicts happen when:
1. Multiple browser tabs send heartbeats simultaneously
2. Initial heartbeat race on page load
3. Session lookup + patch is not atomic

Dashboard shows spikes of 105-140 retries during peak usage (2/21/2026 11:20 PM).

## Root Cause

1. Backend 20s dedup window is shorter than frontend 30s heartbeat interval
2. Multiple tabs from same browser each send independent heartbeats
3. No cross-tab coordination to elect a single heartbeat sender

## Proposed Solution

### Backend Changes (convex/stats.ts)

1. Increase `HEARTBEAT_DEDUP_MS` from 20s to 45s
2. Keep idempotent early return pattern

### Frontend Changes (src/hooks/usePageTracking.ts)

1. Increase `HEARTBEAT_DEBOUNCE_MS` from 20s to 45s
2. Add BroadcastChannel for cross-tab coordination (only leader tab sends heartbeats)
3. Ensure `isStatsEnabled` check covers all heartbeat-related code paths

## Files to Change

- `convex/stats.ts` - Increase dedup window constant
- `src/hooks/usePageTracking.ts` - Add BroadcastChannel coordination, increase debounce

## Edge Cases

- BroadcastChannel not supported in older browsers (Safari < 15.4) - fallback to existing behavior
- Tab closes while leader - another tab claims leadership
- SSR/no window - already handled with typeof checks

## Verification Steps

1. Open site in multiple tabs
2. Check Convex dashboard for write conflict retries
3. Verify only one tab sends heartbeats (check Network tab)
4. Set `statsPage.enabled: false` and confirm no heartbeats sent
