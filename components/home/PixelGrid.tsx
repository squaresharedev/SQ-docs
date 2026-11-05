/*
 * Copied from the homepage: Home/src/components/PixelGrid.tsx. Changes: colours
 * are tokens resolved where the canvas sits (so a `.dark` scope applies) and in
 * any CSS colour syntax the tokens use (hex, oklch), and the faint resting dots
 * are the foreground token at 2.2% instead of a literal white.
 */
"use client";

import { useEffect, useRef } from "react";

interface PixelGridProps {
  /** Grid step in CSS px (cell size including the gap). */
  cellSize?: number;
  /** Gap between lit pixels in CSS px. */
  gap?: number;
  /** Lit-pixel color: any CSS colour, or a token like var(--color-acid). */
  color?: string;
  /** Resting dot-matrix colour, drawn at 2.2%. */
  baseColor?: string;
  /** Radius of the cursor's influence in CSS px. */
  radius?: number;
  className?: string;
}

/** Opacity of the resting dot matrix. */
const BASE_ALPHA = 0.022;

/**
 * Any CSS colour, or var(--token) read on `element`, as sRGB channels: painted
 * on a one-pixel canvas and read back, because browsers keep oklch() as
 * written when a canvas reports its fillStyle.
 */
function resolveRgb(input: string, element: Element): [number, number, number] {
  const token = /^var\(\s*(--[\w-]+)\s*\)$/.exec(input)?.[1];
  const value = token ? getComputedStyle(element).getPropertyValue(token).trim() : input;
  const probe = document.createElement("canvas").getContext("2d");
  if (!probe) return [0, 0, 0];
  probe.canvas.width = 1;
  probe.canvas.height = 1;
  probe.fillStyle = value || "#000";
  probe.fillRect(0, 0, 1, 1);
  const [r = 0, g = 0, b = 0] = probe.getImageData(0, 0, 1, 1).data;
  return [r, g, b];
}

// Cheap deterministic per-cell jitter so the lit area reads as "pixels",
// not a perfect circle.
function cellWeight(col: number, row: number): number {
  const x = Math.sin(col * 12.9898 + row * 78.233) * 43758.5453;
  return 0.55 + (x - Math.floor(x)) * 0.45; // 0.55..1.0
}

export default function PixelGrid({
  cellSize = 24,
  gap = 3,
  color = "var(--color-acid)",
  baseColor = "var(--foreground)",
  radius = 140,
  className = "",
}: PixelGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const [r, g, b] = resolveRgb(color, canvas);
    const baseFill = `rgba(${resolveRgb(baseColor, canvas).join(", ")}, ${BASE_ALPHA})`;
    const dotSize = Math.max(1, cellSize - gap);
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let width = 0;
    let height = 0;
    let cols = 0;
    let rows = 0;
    // Current illumination per cell (0..1), eased toward the mouse target.
    let level = new Float32Array(0);

    const mouse = { x: -9999, y: -9999, active: false };
    let raf = 0;
    let running = false;

    const drawBase = () => {
      ctx.clearRect(0, 0, width, height);
      // Faint static dot-matrix so the pixel texture is always present on the bg.
      ctx.fillStyle = baseFill;
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          ctx.fillRect(col * cellSize, row * cellSize, dotSize, dotSize);
        }
      }
    };

    const resize = () => {
      const rect = host.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      if (width === 0 || height === 0) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(width / cellSize);
      rows = Math.ceil(height / cellSize);
      level = new Float32Array(cols * rows);
      drawBase();
    };

    const frame = () => {
      ctx.clearRect(0, 0, width, height);
      const radiusSq = radius * radius;
      let busy = false;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const idx = row * cols + col;
          let target = 0;

          if (mouse.active) {
            const cx = col * cellSize + cellSize / 2;
            const cy = row * cellSize + cellSize / 2;
            const dx = cx - mouse.x;
            const dy = cy - mouse.y;
            const distSq = dx * dx + dy * dy;
            if (distSq < radiusSq) {
              const falloff = 1 - Math.sqrt(distSq) / radius;
              target = falloff * falloff * cellWeight(col, row);
            }
          }

          // Rise fast toward the cursor, fade slowly into a trail.
          const cur = level[idx];
          const ease = target > cur ? 0.3 : 0.06;
          const next = cur + (target - cur) * ease;
          level[idx] = next;

          if (next > 0.004) {
            busy = true;
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${next})`;
          } else {
            ctx.fillStyle = baseFill;
          }
          ctx.fillRect(col * cellSize, row * cellSize, dotSize, dotSize);
        }
      }

      // Keep animating while the cursor is engaged or a trail is still decaying.
      if (mouse.active || busy) {
        raf = requestAnimationFrame(frame);
      } else {
        running = false;
        drawBase();
      }
    };

    const kick = () => {
      if (running || reduceMotion) return;
      running = true;
      raf = requestAnimationFrame(frame);
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
      kick();
    };

    const onPointerOut = () => {
      mouse.active = false;
      mouse.x = -9999;
      mouse.y = -9999;
    };

    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(host);

    if (!reduceMotion) {
      host.addEventListener("pointermove", onPointerMove, { passive: true });
      host.addEventListener("pointerleave", onPointerOut, { passive: true });
      host.addEventListener("pointercancel", onPointerOut, { passive: true });
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      host.removeEventListener("pointermove", onPointerMove);
      host.removeEventListener("pointerleave", onPointerOut);
      host.removeEventListener("pointercancel", onPointerOut);
    };
  }, [cellSize, gap, color, baseColor, radius]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none ${className}`}
    />
  );
}
