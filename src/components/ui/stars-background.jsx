"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

const WARM_STAR_PALETTE = [
  { r: 255, g: 255, b: 255 }, // Warm White
  { r: 255, g: 248, b: 220 }, // Cornsilk / Cream
  { r: 254, g: 240, b: 138 }, // Soft Pale Gold
  { r: 234, g: 179, b: 8 },   // PrepZii Brand Gold
];

/**
 * StarsBackground
 * High-performance, canvas-driven subtle starfield inspired by Inspira UI.
 * Features warm-white & muted gold stars, multi-depth parallax, slow drift,
 * responsive mobile attenuation, and complete prefers-reduced-motion support.
 */
export function StarsBackground({
  starDensity = 0.0001, // Stars per square pixel (~70-100 on desktop, ~30-40 on mobile)
  minStarRadius = 0.5,
  maxStarRadius = 1.2,
  minOpacity = 0.1,
  maxOpacity = 0.45,
  speed = 0.04, // Very slow, calm drift
  twinkleSpeed = 0.02,
  className = "",
  style = {},
  ...props
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const starsRef = useRef([]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // Detect prefers-reduced-motion
    const motionMediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let isReducedMotion = motionMediaQuery.matches;

    // Detect mobile viewport
    const mobileMediaQuery = window.matchMedia("(max-width: 768px)");
    let isMobile = mobileMediaQuery.matches;

    const handleMotionChange = (e) => {
      isReducedMotion = e.matches;
      renderStaticFrame();
    };

    const handleMobileChange = (e) => {
      isMobile = e.matches;
      initStars();
    };

    if (motionMediaQuery.addEventListener) {
      motionMediaQuery.addEventListener("change", handleMotionChange);
      mobileMediaQuery.addEventListener("change", handleMobileChange);
    } else {
      motionMediaQuery.addListener(handleMotionChange);
      mobileMediaQuery.addListener(handleMobileChange);
    }

    let width = 0;
    let height = 0;
    let dpr = 1;

    const initStars = () => {
      const rect = container.getBoundingClientRect();
      width = Math.floor(rect.width);
      height = Math.floor(rect.height);

      if (width === 0 || height === 0) return;

      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const area = width * height;
      const density = isMobile ? starDensity * 0.45 : starDensity;
      const starCount = Math.max(15, Math.floor(area * density));

      const stars = [];
      for (let i = 0; i < starCount; i++) {
        const depth = 0.4 + Math.random() * 0.6; // 0.4 (far) to 1.0 (near)
        const radius = minStarRadius + (maxStarRadius - minStarRadius) * depth;
        const color = WARM_STAR_PALETTE[Math.floor(Math.random() * WARM_STAR_PALETTE.length)];
        const baseAlpha = minOpacity + Math.random() * (maxOpacity - minOpacity) * (isMobile ? 0.75 : 1);
        
        // Gentle drift angle: mostly drifting slowly upwards / sideways
        const angle = Math.random() * Math.PI * 2;
        const driftSpeed = (isMobile ? speed * 0.4 : speed) * depth;

        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius,
          depth,
          color,
          baseAlpha,
          currentAlpha: baseAlpha,
          vx: Math.cos(angle) * driftSpeed,
          vy: Math.sin(angle) * driftSpeed - 0.02, // Subtle upward tendency
          phase: Math.random() * Math.PI * 2,
          phaseSpeed: twinkleSpeed * (0.6 + Math.random() * 0.8),
        });
      }

      starsRef.current = stars;
      renderStaticFrame();
    };

    const renderStaticFrame = () => {
      if (!ctx || width === 0 || height === 0) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const stars = starsRef.current;
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        ctx.fillStyle = `rgba(${star.color.r}, ${star.color.g}, ${star.color.b}, ${star.baseAlpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(star.x * dpr, star.y * dpr, star.radius * dpr, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const animate = () => {
      if (isReducedMotion) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const stars = starsRef.current;

      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];

        // Update twinkle phase
        star.phase += star.phaseSpeed;
        const twinkleFactor = Math.sin(star.phase) * 0.12;
        star.currentAlpha = Math.max(0.04, Math.min(star.baseAlpha + twinkleFactor, 0.7));

        // Update position drift
        star.x += star.vx;
        star.y += star.vy;

        // Wrap around bounds
        if (star.x < 0) star.x = width;
        if (star.x > width) star.x = 0;
        if (star.y < 0) star.y = height;
        if (star.y > height) star.y = 0;

        // Draw star
        ctx.fillStyle = `rgba(${star.color.r}, ${star.color.g}, ${star.color.b}, ${star.currentAlpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(star.x * dpr, star.y * dpr, star.radius * dpr, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    const resizeObserver = new ResizeObserver(() => {
      initStars();
      if (!isReducedMotion && !animationFrameRef.current) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    });

    resizeObserver.observe(container);
    initStars();

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
    starDensity,
    minStarRadius,
    maxStarRadius,
    minOpacity,
    maxOpacity,
    speed,
    twinkleSpeed,
  ]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      role="presentation"
      className={cn("pointer-events-none absolute inset-0 select-none overflow-hidden", className)}
      style={style}
      {...props}
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}

export default StarsBackground;
