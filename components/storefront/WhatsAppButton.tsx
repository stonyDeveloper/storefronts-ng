"use client";

import { motion, useReducedMotion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { waMeLink } from "@/lib/utils";

interface WhatsAppButtonProps {
  phone: string;
  country: string;
  storeName: string;
}

export function WhatsAppButton({ phone, country, storeName }: WhatsAppButtonProps) {
  const shouldReduceMotion = useReducedMotion();
  const href = waMeLink(phone, country, `Hi ${storeName}, I'd like to ask about your products.`);

  if (!href) return null;

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Chat with ${storeName} on WhatsApp`}
      initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.6, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
      className="fixed bottom-5 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg shadow-emerald-900/20 sm:bottom-6 sm:right-6"
    >
      <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#25D366] opacity-40 motion-reduce:hidden" />
      <MessageCircle className="h-7 w-7 text-white" strokeWidth={2} />
    </motion.a>
  );
}
