"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { StepIndicator } from "./StepIndicator";
import { Step1StoreName } from "./steps/Step1StoreName";
import { Step2Category } from "./steps/Step2Category";
import { Step3Appearance } from "./steps/Step3Appearance";
import { Step4Bank } from "./steps/Step4Bank";
import { Step5Review } from "./steps/Step5Review";
import type { HeroStyle } from "@/lib/validations";

export interface WizardData {
  name: string;
  slug: string;
  category: string;
  description: string;
  primaryColor: string;
  accentColor: string;
  heroStyle: HeroStyle;
  logoUrl: string;
  bankCode: string;
  bankAccountNumber: string;
  bankAccountName: string;
  bankDisplayName: string;
}

const DEFAULTS: WizardData = {
  name: "",
  slug: "",
  category: "GENERAL",
  description: "",
  primaryColor: "#18181B",
  accentColor: "#F4F4F5",
  heroStyle: "auto",
  logoUrl: "",
  bankCode: "",
  bankAccountNumber: "",
  bankAccountName: "",
  bankDisplayName: "",
};

const STEP_LABELS = ["Store name", "Category", "Appearance", "Bank", "Review"];

const stepVariants = {
  enter: { opacity: 0, y: 18 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export function OnboardingWizard() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<WizardData>(DEFAULTS);

  function handleNext(partial: Partial<WizardData>) {
    setData((prev) => ({ ...prev, ...partial }));
    setStep((s) => s + 1);
  }

  function handleBack() {
    setStep((s) => s - 1);
  }

  return (
    <div className="mx-auto max-w-lg w-full py-8 px-4">
      <StepIndicator currentStep={step} totalSteps={5} labels={STEP_LABELS} />

      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 sm:p-8">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {step === 1 && <Step1StoreName data={data} onNext={handleNext} />}
            {step === 2 && <Step2Category data={data} onNext={handleNext} onBack={handleBack} />}
            {step === 3 && <Step3Appearance data={data} onNext={handleNext} onBack={handleBack} />}
            {step === 4 && <Step4Bank data={data} onNext={handleNext} onBack={handleBack} />}
            {step === 5 && <Step5Review data={data} onBack={handleBack} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
