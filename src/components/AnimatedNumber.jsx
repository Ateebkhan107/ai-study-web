"use client";

import { useReducedMotion } from "motion/react";
import { SlidingNumber } from "@/components/animate-ui/primitives/texts/sliding-number";

function formatNumber(value, { decimalPlaces = 0, thousandSeparator = "," } = {}) {
  const number = Number(value) || 0;
  return number.toLocaleString("en", {
    maximumFractionDigits: decimalPlaces,
    minimumFractionDigits: decimalPlaces,
  }).replaceAll(",", thousandSeparator);
}

export default function AnimatedNumber({
  number,
  className = "",
  decimalPlaces = 0,
  prefix = "",
  suffix = "",
  thousandSeparator = ",",
}) {
  const shouldReduceMotion = useReducedMotion();
  const numericValue = Number(number) || 0;

  if (shouldReduceMotion) {
    return (
      <span className={className}>
        {prefix}{formatNumber(numericValue, { decimalPlaces, thousandSeparator })}{suffix}
      </span>
    );
  }

  return (
    <span className={className}>
      {prefix}
      <SlidingNumber
        number={numericValue}
        fromNumber={0}
        decimalPlaces={decimalPlaces}
        thousandSeparator={thousandSeparator}
        transition={{ stiffness: 180, damping: 24, mass: 0.45 }}
      />
      {suffix}
    </span>
  );
}
