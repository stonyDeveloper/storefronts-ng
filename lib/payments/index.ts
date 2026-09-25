import { paystackProvider } from "./paystack";
import type { PaymentProvider } from "./types";

export function getPaymentProvider(): PaymentProvider {
  // Only Paystack for MVP. Add Monnify/Flutterwave adapters here later.
  return paystackProvider;
}

export type { PaymentProvider } from "./types";
