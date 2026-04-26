import { useRef, useEffect, useCallback, useState } from "react";
import * as THREE from "three";
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
} from "d3-force-3d";

interface GraphNode {
  slug: string;
  title: string;
  pageType: string;
  category?: string;
  inboundLinks: number;
  outboundLinks: string[];
  x?: number;
  y?: number;
  z?: number;
  index?: number;
}

interface GraphEdge {
  source: string | GraphNode;
  target: string | GraphNode;
}

interface KnowledgeGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  onNodeClick?: (slug: string) => void;
  highlightSlug?: string | null;
  compact?: boolean;
}

const TYPE_COLORS: Record<string, number> = {
  concept: 0x6ec6ff,
  entity: 0xa5d6a7,
  comparison: 0xffcc80,
  overview: 0xce93d8,
  synthesis: 0xef9a9a,
};
const DEFAULT_COLOR = 0x90a4ae;

function getNodeColor(pageType: string): number {
  return TYPE_COLORS[pageType] ?? DEFAULT_COLOR;
}

export default function KnowledgeGraph({
  nodes,
  edges,
  onNodeClick,
  highlightSlug,
  compact = false,
}: KnowledgeGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const frameRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0, isDown: false, lastX: 0, lastY: 0 });
  const rotationRef = useRef({ x: 0.3, y: 0, autoRotate: true });
  const raycasterRef = useRef(new THREE.Raycaster());
  const hoveredRef = useRef<string | null>(null);
  const nodeMapRef = useRef<Map<string, number>>(new Map());
  const positionsRef = useRef<Float32Array | null>(null);
  const colorsRef = useRef<Float32Array | null>(null);
  const sizesRef = useRef<Float32Array | null>(null);
  const baseColorsRef = useRef<Float32Array | null>(null);
  const zoomRef = useRef(compact ? 180 : 280);
  const [tooltipText, setTooltipText] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const handleClick = useCallback(
    (slug: string) => {
      onNodeClick?.(slug);
    },
    [onNodeClick],
  );

  const zoomIn = useCallback(() => {
    zoomRef.current = Math.max(40, zoomRef.current - 40);
  }, []);

  const zoomOut = useCallback(() => {
    zoomRef.current = Math.min(800, zoomRef.current + 40);
  }, []);

  const resetView = useCallback(() => {
    zoomRef.current = compact ? 180 : 280;
    rotationRef.current = { x: 0.3, y: 0, autoRotate: true };
  }, [compact]);

  useEffect(() => {
    if (!containerRef.current || nodes.length === 0) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(50, width / height, 1, 2000);
    camera.position.z = zoomRef.current;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const simNodes: GraphNode[] = nodes.map((n) => ({ ...n }));
    const simEdges: GraphEdge[] = edges.map((e) => ({
      source: typeof e.source === "string" ? e.source : e.source.slug,
      target: typeof e.target === "string" ? e.target : e.target.slug,
    }));

    const nodeMap = new Map<string, number>();
    simNodes.forEach((n, i) => nodeMap.set(n.slug, i));
    nodeMapRef.current = nodeMap;

    const spreadFactor = compact ? 30 : 60;
    const simulation = forceSimulation(simNodes, 3)
      .force(
        "link",
        forceLink(simEdges)
          .id((d: GraphNode) => d.slug)
          .distance(spreadFactor)
          .strength(0.4),
      )
      .force("charge", forceManyBody().strength(-spreadFactor * 2))
      .force("center", forceCenter(0, 0, 0))
      .force("collide", forceCollide().radius(8))
      .stop();

    const iterations = Math.min(200, 50 + nodes.length * 2);
    for (let i = 0; i < iterations; i++) {
      simulation.tick();
    }

    const count = simNodes.length;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const baseColors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const node = simNodes[i];
      positions[i * 3] = node.x ?? 0;
      positions[i * 3 + 1] = node.y ?? 0;
      positions[i * 3 + 2] = node.z ?? 0;

      const color = new THREE.Color(getNodeColor(node.pageType));
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
      baseColors[i * 3] = color.r;
      baseColors[i * 3 + 1] = color.g;
      baseColors[i * 3 + 2] = color.b;

      // Larger base sizes for visibility
      const baseSize = compact ? 10 : 14;
      sizes[i] = baseSize + Math.min(node.inboundLinks * 3, 24);
    }

    positionsRef.current = positions;
    colorsRef.current = colors;
    sizesRef.current = sizes;
    baseColorsRef.current = baseColors;

    const pointsGeometry = new THREE.BufferGeometry();
    pointsGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3),
    );
    pointsGeometry.setAttribute(
      "color",
      new THREE.BufferAttribute(colors, 3),
    );
    pointsGeometry.setAttribute(
      "size",
      new THREE.BufferAttribute(sizes, 1),
    );

    const pointsMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uPixelRatio: { value: renderer.getPixelRatio() },
      },
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        varying float vSize;
        uniform float uPixelRatio;
        void main() {
          vColor = color;
          vSize = size;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * uPixelRatio * (300.0 / -mvPosition.z);
          gl_PointSize = max(gl_PointSize, 3.0);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vSize;
        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          float glow = 1.0 - smoothstep(0.0, 0.5, dist);
          float alpha = glow * 0.9;
          gl_FragColor = vec4(vColor * glow, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const points = new THREE.Points(pointsGeometry, pointsMaterial);
    scene.add(points);

    // Edges
    const edgePositions: number[] = [];
    for (const edge of simEdges) {
      const sourceSlug =
        typeof edge.source === "string" ? edge.source : edge.source.slug;
      const targetSlug =
        typeof edge.target === "string" ? edge.target : edge.target.slug;
      const si = nodeMap.get(sourceSlug);
      const ti = nodeMap.get(targetSlug);
      if (si !== undefined && ti !== undefined) {
        edgePositions.push(
          positions[si * 3],
          positions[si * 3 + 1],
          positions[si * 3 + 2],
          positions[ti * 3],
          positions[ti * 3 + 1],
          positions[ti * 3 + 2],
        );
      }
    }

    if (edgePositions.length > 0) {
      const edgeGeometry = new THREE.BufferGeometry();
      edgeGeometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(edgePositions, 3),
      );
      const edgeMaterial = new THREE.LineBasicMaterial({
        color: 0x556677,
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending,
      });
      const lines = new THREE.LineSegments(edgeGeometry, edgeMaterial);
      scene.add(lines);
    }

    // Mouse/touch controls
    const onMouseDown = (e: MouseEvent) => {
      mouseRef.current.isDown = true;
      mouseRef.current.lastX = e.clientX;
      mouseRef.current.lastY = e.clientY;
      rotationRef.current.autoRotate = false;
    };
    const onMouseUp = () => {
      mouseRef.current.isDown = false;
    };
    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (mouseRef.current.isDown) {
        const dx = e.clientX - mouseRef.current.lastX;
        const dy = e.clientY - mouseRef.current.lastY;
        rotationRef.current.y += dx * 0.005;
        rotationRef.current.x += dy * 0.005;
        mouseRef.current.lastX = e.clientX;
        mouseRef.current.lastY = e.clientY;
      }
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      zoomRef.current = Math.max(
        40,
        Math.min(800, zoomRef.current + e.deltaY * 0.3),
      );
    };
    const onClick = () => {
      if (hoveredRef.current) {
        handleClick(hoveredRef.current);
      }
    };

    container.addEventListener("mousedown", onMouseDown);
    container.addEventListener("mouseup", onMouseUp);
    container.addEventListener("mousemove", onMouseMove);
    container.addEventListener("wheel", onWheel, { passive: false });
    container.addEventListener("click", onClick);

    // Render loop
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);

      if (rotationRef.current.autoRotate) {
        rotationRef.current.y += 0.002;
      }

      const r = zoomRef.current;
      const rx = rotationRef.current.x;
      const ry = rotationRef.current.y;
      camera.position.x = r * Math.sin(ry) * Math.cos(rx);
      camera.position.y = r * Math.sin(rx);
      camera.position.z = r * Math.cos(ry) * Math.cos(rx);
      camera.lookAt(0, 0, 0);

      // Raycasting for hover (wider threshold for bigger dots)
      raycasterRef.current.setFromCamera(
        new THREE.Vector2(mouseRef.current.x, mouseRef.current.y),
        camera,
      );
      raycasterRef.current.params.Points = { threshold: compact ? 6 : 8 };
      const intersects = raycasterRef.current.intersectObject(points);

      for (let i = 0; i < count; i++) {
        colors[i * 3] = baseColors[i * 3];
        colors[i * 3 + 1] = baseColors[i * 3 + 1];
        colors[i * 3 + 2] = baseColors[i * 3 + 2];
      }

      let newHovered: string | null = null;
      if (intersects.length > 0) {
        const idx = intersects[0].index;
        if (idx !== undefined && idx < simNodes.length) {
          newHovered = simNodes[idx].slug;
          colors[idx * 3] = 1;
          colors[idx * 3 + 1] = 1;
          colors[idx * 3 + 2] = 1;
          const hNode = simNodes[idx];
          for (const linked of hNode.outboundLinks) {
            const li = nodeMap.get(linked);
            if (li !== undefined) {
              colors[li * 3] = Math.min(baseColors[li * 3] * 1.6, 1);
              colors[li * 3 + 1] = Math.min(baseColors[li * 3 + 1] * 1.6, 1);
              colors[li * 3 + 2] = Math.min(baseColors[li * 3 + 2] * 1.6, 1);
            }
          }
        }
      }
      hoveredRef.current = newHovered;

      if (highlightSlug) {
        const hi = nodeMap.get(highlightSlug);
        if (hi !== undefined) {
          colors[hi * 3] = 1;
          colors[hi * 3 + 1] = 1;
          colors[hi * 3 + 2] = 1;
        }
      }

      pointsGeometry.attributes.color.needsUpdate = true;
      points.rotation.y += 0.0003;
      renderer.render(scene, camera);
    };

    animate();

    // Resize handler
    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(frameRef.current);
      resizeObserver.disconnect();
      container.removeEventListener("mousedown", onMouseDown);
      container.removeEventListener("mouseup", onMouseUp);
      container.removeEventListener("mousemove", onMouseMove);
      container.removeEventListener("wheel", onWheel);
      container.removeEventListener("click", onClick);
      renderer.dispose();
      pointsGeometry.dispose();
      pointsMaterial.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [nodes, edges, compact, highlightSlug, handleClick]);

  // Tooltip follows mouse when hovering a node
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onMove = (e: MouseEvent) => {
      const hovered = hoveredRef.current;
      if (hovered) {
        const node = nodes.find((n) => n.slug === hovered);
        setTooltipText(node ? node.title : hovered);
        const rect = container.getBoundingClientRect();
        setTooltipPos({ x: e.clientX - rect.left + 12, y: e.clientY - rect.top - 8 });
      } else {
        setTooltipText(null);
      }
    };

    container.addEventListener("mousemove", onMove);
    return () => container.removeEventListener("mousemove", onMove);
  }, [nodes]);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <div
        ref={containerRef}
        className="knowledge-graph-canvas"
        style={{
          width: "100%",
          height: "100%",
          cursor: hoveredRef.current ? "pointer" : "grab",
        }}
      />

      {/* Zoom and reset controls */}
      <div className="graph-controls">
        <button onClick={zoomIn} title="Zoom in" className="graph-control-btn">+</button>
        <button onClick={zoomOut} title="Zoom out" className="graph-control-btn">&minus;</button>
        <button onClick={resetView} title="Reset view" className="graph-control-btn graph-control-reset">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 8a6 6 0 0 1 10.5-4M14 8a6 6 0 0 1-10.5 4" />
            <path d="M13 1v4h-4M3 15v-4h4" />
          </svg>
        </button>
      </div>

      {/* Hover tooltip */}
      {tooltipText && (
        <div
          className="graph-tooltip"
          style={{ left: tooltipPos.x, top: tooltipPos.y }}
        >
          {tooltipText}
        </div>
      )}
    </div>
  );
}
