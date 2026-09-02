"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Parses color strings (#hex, rgb, rgba) into { r, g, b } components.
 */
function parseColor(colorStr, fallback = { r: 234, g: 179, b: 8 }) {
  if (!colorStr) return fallback;

  const trimmed = colorStr.trim();
  if (trimmed.startsWith("#")) {
    let hex = trimmed.slice(1);
    if (hex.length === 3) {
      hex = hex.split("").map((c) => c + c).join("");
    }
    const num = parseInt(hex, 16);
    if (Number.isNaN(num)) return fallback;
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
    };
  }

  const match = trimmed.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (match) {
    return {
      r: parseInt(match[1], 10),
      g: parseInt(match[2], 10),
      b: parseInt(match[3], 10),
    };
  }

  return fallback;
}

/**
 * FlickeringGrid
 * High-performance, canvas-driven decorative grid with calm flickering,
 * dark/light mode adaptability, mobile optimizations, and prefers-reduced-motion support.
 */
export function FlickeringGrid({
  squareSize = 4,
  gridGap = 8,
  flickerChance = 0.15,
  color = "#EAB308", // PrepZii brand warm gold
  lightColor = "#CA8A04", // Subtle warm amber for light mode
  maxOpacity = 0.18,
  lightMaxOpacity = 0.12,
  flickerInterval = 50, // ms between frame updates (~20fps for calm, low-CPU motion)
  className = "",
  style = {},
  ...props
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const stateRef = useRef({
    squares: null,
    cols: 0,
    rows: 0,
    lastTime: 0,
  });

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // Detect prefers-reduced-motion
    const motionMediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let isReducedMotion = motionMediaQuery.matches;

    // Detect mobile device / narrow viewport
    const mobileMediaQuery = window.matchMedia("(max-width: 768px)");
    let isMobile = mobileMediaQuery.matches;

    // Detect dark mode from document or closest dark class
    const isDarkMode = () => {
      return (
        document.documentElement.classList.contains("dark") ||
        Boolean(container.closest(".dark"))
      );
    };

    const handleMotionChange = (e) => {
      isReducedMotion = e.matches;
      drawGrid(true);
    };

    const handleMobileChange = (e) => {
      isMobile = e.matches;
      updateGridSize();
    };

    if (motionMediaQuery.addEventListener) {
      motionMediaQuery.addEventListener("change", handleMotionChange);
      mobileMediaQuery.addEventListener("change", handleMobileChange);
    } else {
      motionMediaQuery.addListener(handleMotionChange);
      mobileMediaQuery.addListener(handleMobileChange);
    }

    const getActiveConfig = () => {
      const dark = isDarkMode();
      const baseColorStr = dark ? color : lightColor;
      const rgb = parseColor(baseColorStr, dark ? { r: 234, g: 179, b: 8 } : { r: 202, g: 138, b: 4 });
      
      const effectiveMaxOpacity = isMobile ? Math.min(maxOpacity * 0.75, 0.12) : (dark ? maxOpacity : lightMaxOpacity);
      const effectiveFlickerChance = isMobile ? Math.min(flickerChance * 0.3, 0.04) : flickerChance;
      const effectiveGap = isMobile ? Math.max(gridGap, 9) : gridGap;
      const effectiveSquareSize = isMobile ? Math.min(squareSize, 3.5) : squareSize;

      return {
        rgb,
        effectiveMaxOpacity,
        effectiveFlickerChance,
        effectiveGap,
        effectiveSquareSize,
      };
    };

    const updateGridSize = () => {
      const rect = container.getBoundingClientRect();
      const width = Math.floor(rect.width);
      const height = Math.floor(rect.height);

      if (width === 0 || height === 0) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const { effectiveSquareSize, effectiveGap, effectiveMaxOpacity } = getActiveConfig();
      const step = effectiveSquareSize + effectiveGap;
      const cols = Math.max(1, Math.floor((width + effectiveGap) / step));
      const rows = Math.max(1, Math.floor((height + effectiveGap) / step));

      const totalSquares = cols * rows;
      const squares = new Float32Array(totalSquares);

      // Seed initial opacities randomly
      for (let i = 0; i < totalSquares; i++) {
        squares[i] = Math.random() * effectiveMaxOpacity;
      }

      stateRef.current = {
        squares,
        cols,
        rows,
        width,
        height,
        dpr,
        lastTime: 0,
      };

      drawGrid(true);
    };

    const drawGrid = (force = false) => {
      const { squares, cols, rows, dpr } = stateRef.current;
      if (!squares || cols === 0 || rows === 0) return;

      const {
        rgb,
        effectiveMaxOpacity,
        effectiveFlickerChance,
        effectiveGap,
        effectiveSquareSize,
      } = getActiveConfig();

      const step = (effectiveSquareSize + effectiveGap) * dpr;
      const sqSize = effectiveSquareSize * dpr;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const idx = r * cols + c;
          
          if (!isReducedMotion && !force && Math.random() < effectiveFlickerChance) {
            squares[idx] = Math.random() * effectiveMaxOpacity;
          }

          const opacity = squares[idx];
          if (opacity > 0.005) {
            ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity.toFixed(3)})`;
            ctx.fillRect(c * step, r * step, sqSize, sqSize);
          }
        }
      }
    };

    const animate = (time) => {
      if (isReducedMotion) {
        return;
      }

      const elapsed = time - stateRef.current.lastTime;
      const currentInterval = isMobile ? Math.max(flickerInterval * 1.5, 80) : flickerInterval;

      if (elapsed >= currentInterval) {
        stateRef.current.lastTime = time - (elapsed % currentInterval);
        drawGrid();
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Initialize ResizeObserver
    const resizeObserver = new ResizeObserver(() => {
      updateGridSize();
      if (!isReducedMotion && !animationFrameRef.current) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    });

    resizeObserver.observe(container);
    updateGridSize();

    if (!isReducedMotion) {
      animationFrameRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      resizeObserver.disconnect();
      if (motionMediaQuery.removeEventListener) {
        motionMediaQuery.removeEventListener("change", handleMotionChange);
        mobileMediaQuery.removeEventListener("change", handleMobileChange);
      } else {
        motionMediaQuery.removeListener(handleMotionChange);
        mobileMediaQuery.removeListener(handleMobileChange);
      }
    };
  }, [
    squareSize,
    gridGap,
    flickerChance,
    color,
    lightColor,
    maxOpacity,
    lightMaxOpacity,
    flickerInterval,
  ]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      role="presentation"
      className={cn("pointer-events-none relative h-full w-full select-none overflow-hidden", className)}
      style={style}
      {...props}
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}

export default FlickeringGrid;
