"use client";

import React, { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * BreathingText
 * A smooth, premium React component inspired by Inspira UI Breathing Text.
 * Employs a slow, harmonic weight and slant breath cycle with rest pauses,
 * responsive mobile attenuation, and complete prefers-reduced-motion compliance.
 */
export function BreathingText({
  children,
  text,
  className = "",
  // Font weight animation range
  fromWeight = 550,
  toWeight = 720,
  // Slant / italic skew animation range (in degrees)
  fromSlant = 0,
  toSlant = -3,
  // Timing parameters (in seconds)
  duration = 1.8,
  pause = 1.6,
  delay = 0,
  as: Component = "span",
  style = {},
  ...props
}) {
  const shouldReduceMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(typeof window !== "undefined" && window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const content = text ?? children;

  // If reduced motion is requested, render static text with baseline weight
  if (shouldReduceMotion) {
    return (
      <Component
        className={cn("inline-block", className)}
        style={{ fontWeight: fromWeight, ...style }}
        {...props}
      >
        {content}
      </Component>
    );
  }

  // Attenuate the effect on mobile viewports for clean, subtle readability
  const effectiveToWeight = isMobile
    ? Math.round(fromWeight + (toWeight - fromWeight) * 0.4)
    : toWeight;
  const effectiveToSlant = isMobile ? toSlant * 0.35 : toSlant;
  const effectiveDuration = isMobile ? duration * 1.1 : duration;
  const effectivePause = isMobile ? pause * 1.2 : pause;

  // Normalized keyframe timings: [0 (start), inhale_end, exhale_end, pause_end (loop)]
  const totalCycle = effectiveDuration * 2 + effectivePause;
  const inhaleFrac = effectiveDuration / totalCycle;
  const exhaleFrac = (effectiveDuration * 2) / totalCycle;

  const animationVariants = {
    animate: {
      fontWeight: [fromWeight, effectiveToWeight, fromWeight, fromWeight],
      skewX: [fromSlant, effectiveToSlant, fromSlant, fromSlant],
      fontVariationSettings: [
        `'wght' ${fromWeight}, 'SOFT' 10`,
        `'wght' ${effectiveToWeight}, 'SOFT' 60`,
        `'wght' ${fromWeight}, 'SOFT' 10`,
        `'wght' ${fromWeight}, 'SOFT' 10`,
      ],
      transition: {
        duration: totalCycle,
        times: [0, inhaleFrac, exhaleFrac, 1],
        ease: ["easeInOut", "easeInOut", "linear"],
        repeat: Infinity,
        repeatType: "loop",
        delay,
      },
    },
  };

  return (
    <motion.span
      className={cn("inline-block will-change-[font-weight,transform]", className)}
      style={{
        display: "inline-block",
        transformOrigin: "center baseline",
        ...style,
      }}
      variants={animationVariants}
      animate="animate"
      {...props}
    >
      {content}
    </motion.span>
  );
}

export default BreathingText;
