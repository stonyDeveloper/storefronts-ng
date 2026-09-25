export interface InitializePaymentParams {
  amount: number;          // minor units (kobo)
  email: string;
  reference: string;
  subaccountCode: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
}

export interface InitializePaymentResult {
  authorizationUrl: string;
  accessCode: string;
  reference: string;
}

export interface VerifyPaymentResult {
  status: "success" | "failed" | "pending";
  reference: string;
  amount: number;          // minor units
  paidAt?: string;
  channel?: string;
}

export interface CreateSubaccountParams {
  businessName: string;
  bankCode: string;
  accountNumber: string;
  percentageCharge: number; // platform's share, e.g. 3 = 3%
}

export interface CreateSubaccountResult {
  subaccountCode: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
}

export interface ResolveAccountResult {
  accountName: string;
  accountNumber: string;
}

export interface BankListItem {
  name: string;
  code: string;
  slug: string;
}

export interface PaymentProvider {
  initializePayment(params: InitializePaymentParams): Promise<InitializePaymentResult>;
  verifyPayment(reference: string): Promise<VerifyPaymentResult>;
  createSubaccount(params: CreateSubaccountParams): Promise<CreateSubaccountResult>;
  resolveAccount(bankCode: string, accountNumber: string): Promise<ResolveAccountResult>;
  getBanks(): Promise<BankListItem[]>;
}
