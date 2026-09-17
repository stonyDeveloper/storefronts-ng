"use client";

import { Check } from "lucide-react";
import { motion } from "framer-motion";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  labels: string[];
}

export function StepIndicator({ currentStep, totalSteps, labels }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {Array.from({ length: totalSteps }, (_, i) => {
        const step = i + 1;
        const isComplete = step < currentStep;
        const isActive = step === currentStep;

        return (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center">
              <motion.div
                initial={false}
                animate={{
                  backgroundColor: isComplete || isActive ? "#18181b" : "#fff",
                  borderColor: isComplete || isActive ? "#18181b" : "#d4d4d8",
                  scale: isActive ? 1.1 : 1,
                }}
                transition={{ duration: 0.2 }}
                className="w-8 h-8 rounded-full border-2 flex items-center justify-center"
              >
                {isComplete ? (
                  <Check className="w-4 h-4 text-white" strokeWidth={2.5} />
                ) : (
                  <span
                    className={`text-xs font-semibold ${
                      isActive ? "text-white" : "text-zinc-400"
                    }`}
                  >
                    {step}
                  </span>
                )}
              </motion.div>
              <span
                className={`hidden sm:block text-[10px] mt-1.5 font-medium whitespace-nowrap ${
                  isActive ? "text-zinc-900" : isComplete ? "text-zinc-500" : "text-zinc-400"
                }`}
              >
                {labels[i]}
              </span>
            </div>

            {step < totalSteps && (
              <div className="relative mx-1.5 mb-3">
                <div className="h-px w-10 bg-zinc-200" />
                <motion.div
                  className="absolute inset-0 h-px bg-zinc-900"
                  initial={false}
                  animate={{ scaleX: isComplete ? 1 : 0 }}
                  style={{ transformOrigin: "left" }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
