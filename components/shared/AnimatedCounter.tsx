"use client";

import { useEffect, useRef } from "react";
import { useMotionValue, animate, useInView, useReducedMotion } from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  format?: (v: number) => string;
  className?: string;
}

export function AnimatedCounter({ value, format, className }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const isInView = useInView(ref, { once: true });
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (!isInView) return;

    if (shouldReduceMotion) {
      if (ref.current) {
        ref.current.textContent = format ? format(value) : String(value);
      }
      return;
    }

    const controls = animate(motionValue, value, {
      duration: 1.4,
      ease: [0.25, 0.46, 0.45, 0.94],
    });

    const unsubscribe = motionValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = format ? format(latest) : String(Math.round(latest));
      }
    });

    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [isInView, value, motionValue, format, shouldReduceMotion]);

  return (
    <span ref={ref} className={className}>
      {format ? format(0) : "0"}
    </span>
  );
}
