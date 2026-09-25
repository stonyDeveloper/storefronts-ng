declare module "@paystack/inline-js" {
  interface TransactionConfig {
    key: string;
    accessCode?: string;
    email?: string;
    amount?: number;
    ref?: string;
    currency?: string;
    metadata?: Record<string, unknown>;
    onSuccess?: (transaction: { reference: string; status: string }) => void;
    onCancel?: () => void;
    onLoad?: (response: { id: number }) => void;
  }

  class PaystackPop {
    newTransaction(config: TransactionConfig): void;
    // Internally just re-calls newTransaction({ accessCode, ...options }) — it
    // does NOT reuse the handlers passed to the original newTransaction call,
    // so onSuccess/onCancel must be passed again here or they're silently undefined.
    resumeTransaction(
      accessCode: string,
      options?: Pick<TransactionConfig, "onSuccess" | "onCancel" | "onLoad">
    ): void;
    cancelTransaction(): void;
  }

  export default PaystackPop;
}
