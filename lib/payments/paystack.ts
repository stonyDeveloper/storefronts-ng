import type {
  PaymentProvider,
  InitializePaymentParams,
  InitializePaymentResult,
  VerifyPaymentResult,
  CreateSubaccountParams,
  CreateSubaccountResult,
  ResolveAccountResult,
  BankListItem,
} from "./types";

const BASE = "https://api.paystack.co";

async function paystackFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const json = await res.json();

  if (!res.ok || !json.status) {
    throw new Error(json.message ?? `Paystack error ${res.status}`);
  }

  return json.data as T;
}

export const paystackProvider: PaymentProvider = {
  async initializePayment(params: InitializePaymentParams): Promise<InitializePaymentResult> {
    const data = await paystackFetch<{
      authorization_url: string;
      access_code: string;
      reference: string;
    }>("/transaction/initialize", {
      method: "POST",
      body: JSON.stringify({
        amount: params.amount,
        email: params.email,
        reference: params.reference,
        callback_url: params.callbackUrl,
        subaccount: params.subaccountCode,
        // merchant bears Paystack's fee; our platform cut is pre-configured on the subaccount
        bearer: "subaccount",
        metadata: params.metadata,
      }),
    });

    return {
      authorizationUrl: data.authorization_url,
      accessCode: data.access_code,
      reference: data.reference,
    };
  },

  async verifyPayment(reference: string): Promise<VerifyPaymentResult> {
    const data = await paystackFetch<{
      status: string;
      reference: string;
      amount: number;
      paid_at: string;
      channel: string;
    }>(`/transaction/verify/${encodeURIComponent(reference)}`);

    return {
      status: data.status === "success" ? "success" : data.status === "failed" ? "failed" : "pending",
      reference: data.reference,
      amount: data.amount,
      paidAt: data.paid_at,
      channel: data.channel,
    };
  },

  async createSubaccount(params: CreateSubaccountParams): Promise<CreateSubaccountResult> {
    const data = await paystackFetch<{
      subaccount_code: string;
      bank_name: string;
      account_number: string;
      account_name: string;
    }>("/subaccount", {
      method: "POST",
      body: JSON.stringify({
        business_name: params.businessName,
        bank_code: params.bankCode,
        account_number: params.accountNumber,
        percentage_charge: params.percentageCharge,
      }),
    });

    return {
      subaccountCode: data.subaccount_code,
      bankName: data.bank_name,
      accountNumber: data.account_number,
      accountName: data.account_name,
    };
  },

  async resolveAccount(bankCode: string, accountNumber: string): Promise<ResolveAccountResult> {
    const data = await paystackFetch<{
      account_name: string;
      account_number: string;
    }>(`/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`);

    return {
      accountName: data.account_name,
      accountNumber: data.account_number,
    };
  },

  async getBanks(): Promise<BankListItem[]> {
    const data = await paystackFetch<Array<{ name: string; code: string; slug: string }>>(
      "/bank?currency=NGN&use_cursor=false&perPage=100"
    );

    return data.map((b) => ({ name: b.name, code: b.code, slug: b.slug }));
  },
};
