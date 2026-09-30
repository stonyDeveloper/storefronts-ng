"use client";

import { motion, useReducedMotion } from "framer-motion";

interface SuccessAnimationProps {
  primaryColor: string;
}

export function SuccessAnimation({ primaryColor }: SuccessAnimationProps) {
  const reduced = useReducedMotion();

  return (
    <div className="mx-auto flex h-24 w-24 items-center justify-center">
      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-24 w-24">
        {/* Circle */}
        <motion.circle
          cx="40"
          cy="40"
          r="36"
          stroke={primaryColor}
          strokeWidth="4"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={
            reduced
              ? { duration: 0 }
              : { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }
          }
        />
        {/* Checkmark */}
        <motion.path
          d="M24 41L35 52L56 30"
          stroke={primaryColor}
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={
            reduced
              ? { duration: 0 }
              : { duration: 0.5, delay: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
          }
        />
      </svg>
    </div>
  );
}
