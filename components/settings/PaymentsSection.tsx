"use client";

import { useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  ShieldCheck,
  Loader2,
  Building2,
  RefreshCw,
} from "lucide-react";

interface Bank {
  name: string;
  code: string;
}

interface PaymentsSectionProps {
  storeId: string;
  paystackEnabled: boolean;
  bankCode: string | null;
  bankAccountNumber: string | null;
  bankAccountName: string | null;
  codEnabled: boolean;
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

export function PaymentsSection({
  storeId,
  paystackEnabled: initialPaystack,
  bankCode: initialBankCode,
  bankAccountNumber: initialAccNumber,
  bankAccountName: initialAccName,
  codEnabled: initialCod,
}: PaymentsSectionProps) {
  const [paystackEnabled, setPaystackEnabled] = useState(initialPaystack);
  const [bankAccountName, setBankAccountName] = useState(initialAccName ?? "");
  const [showBankForm, setShowBankForm] = useState(!initialPaystack);

  const [codEnabled, setCodEnabled] = useState(initialCod);
  const [codStatus, setCodStatus] = useState<SaveStatus>("idle");

  // Bank form state
  const [banks, setBanks] = useState<Bank[]>([]);
  const [banksLoading, setBanksLoading] = useState(false);
  const [banksError, setBanksError] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [accountNumber, setAccountNumber] = useState("");
  const [resolvedName, setResolvedName] = useState("");
  const [resolving, setResolving] = useState(false);
  const [resolveError, setResolveError] = useState("");
  const [bankStatus, setBankStatus] = useState<SaveStatus>("idle");
  const [bankError, setBankErrorMsg] = useState("");

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showBankForm) return;
    setBanksLoading(true);
    fetch("/api/banks")
      .then((r) => r.json())
      .then((d) => {
        if (d.data) setBanks(d.data);
        else setBanksError(true);
      })
      .catch(() => setBanksError(true))
      .finally(() => setBanksLoading(false));
  }, [showBankForm]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const filteredBanks = banks
    .filter((b) => b.name.toLowerCase().includes(search.toLowerCase()))
    .slice(0, 12);

  async function resolveAccount() {
    if (!selectedBank || accountNumber.length !== 10) return;
    setResolving(true);
    setResolveError("");
    setResolvedName("");
    try {
      const res = await fetch(
        `/api/banks?resolve=1&bankCode=${selectedBank.code}&accountNumber=${accountNumber}`
      );
      const d = await res.json();
      if (d.data?.accountName) {
        setResolvedName(d.data.accountName);
      } else {
        setResolveError(d.error ?? "Could not verify. Check details and try again.");
      }
    } catch {
      setResolveError("Network error — please try again.");
    } finally {
      setResolving(false);
    }
  }

  async function handleSaveBank() {
    if (!selectedBank || !accountNumber || !resolvedName) return;
    setBankStatus("saving");
    setBankErrorMsg("");

    const res = await fetch(`/api/stores/${storeId}/subaccount`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bankCode: selectedBank.code, bankAccountNumber: accountNumber }),
    });

    const json = await res.json();
    if (!res.ok) {
      setBankStatus("error");
      setBankErrorMsg(json.error ?? "Could not create subaccount");
    } else {
      setBankStatus("saved");
      setPaystackEnabled(true);
      setBankAccountName(json.data?.bankAccountName ?? resolvedName);
      setShowBankForm(false);
      setTimeout(() => setBankStatus("idle"), 2500);
    }
  }

  async function handleCodToggle(val: boolean) {
    setCodEnabled(val);
    setCodStatus("saving");
    const res = await fetch(`/api/stores/${storeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ codEnabled: val }),
    });
    if (res.ok) {
      setCodStatus("saved");
      setTimeout(() => setCodStatus("idle"), 2000);
    } else {
      setCodEnabled(!val);
      setCodStatus("error");
    }
  }

  const canVerify = !!selectedBank && accountNumber.length === 10 && !resolving;
  const hasVerified = !!resolvedName;

  return (
    <section className="overflow-hidden rounded-2xl border border-zinc-100 bg-white">
      <div className="border-b border-zinc-50 px-5 py-4">
        <h2 className="text-sm font-semibold text-zinc-900">Payments</h2>
        <p className="mt-0.5 text-xs text-zinc-400">
          Configure how buyers pay and where money goes.
        </p>
      </div>

      <div className="divide-y divide-zinc-50">
        {/* COD toggle */}
        <div className="flex items-center justify-between p-5">
          <div>
            <p className="text-sm font-medium text-zinc-900">Cash on delivery</p>
            <p className="text-xs text-zinc-400">Buyers pay when they receive their order.</p>
          </div>
          <div className="flex items-center gap-2">
            {codStatus === "saving" && <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-400" />}
            {codStatus === "saved" && <span className="text-xs text-emerald-600">Saved</span>}
            <button
              type="button"
              role="switch"
              aria-checked={codEnabled}
              onClick={() => handleCodToggle(!codEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                codEnabled ? "bg-zinc-900" : "bg-zinc-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  codEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Paystack section */}
        <div className="p-5 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-900">Paystack (card, transfer, USSD)</p>
              <p className="text-xs text-zinc-400">
                Payments split automatically — money goes straight to your bank.
              </p>
            </div>
            {paystackEnabled && !showBankForm && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                <CheckCircle2 className="h-3 w-3" />
                Active
              </span>
            )}
          </div>

          {/* Current bank info (when set up and form not shown) */}
          {paystackEnabled && !showBankForm && (
            <div className="flex items-center justify-between rounded-xl bg-zinc-50 px-4 py-3">
              <div className="flex items-center gap-3">
                <Building2 className="h-4 w-4 text-zinc-400" />
                <div>
                  <p className="text-sm font-medium text-zinc-900">{bankAccountName || "Verified account"}</p>
                  <p className="text-xs text-zinc-400">
                    {initialAccNumber
                      ? `••••${initialAccNumber.slice(-4)}`
                      : "Account linked"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowBankForm(true);
                  setSearch("");
                  setSelectedBank(null);
                  setAccountNumber("");
                  setResolvedName("");
                  setResolveError("");
                }}
                className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-700 transition-colors"
              >
                <RefreshCw className="h-3 w-3" />
                Update
              </button>
            </div>
          )}

          {/* Bank setup form */}
          {showBankForm && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-3">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <p className="text-xs text-emerald-700">
                  Your details are only used for Paystack settlement. We never store your BVN or
                  password.
                </p>
              </div>

              {banksLoading && (
                <div className="flex items-center gap-2 text-sm text-zinc-500">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading banks…
                </div>
              )}

              {banksError && (
                <p className="rounded-xl bg-zinc-50 p-4 text-sm text-zinc-500 border border-zinc-100">
                  Could not load bank list. Please refresh the page.
                </p>
              )}

              {!banksLoading && !banksError && (
                <>
                  {/* Bank search */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-zinc-700">Bank</label>
                    <div className="relative" ref={dropdownRef}>
                      <input
                        type="text"
                        value={search}
                        onChange={(e) => {
                          setSearch(e.target.value);
                          setSelectedBank(null);
                          setDropdownOpen(true);
                          setResolvedName("");
                        }}
                        onFocus={() => setDropdownOpen(true)}
                        placeholder="Search your bank…"
                        className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-shadow"
                      />
                      {dropdownOpen && filteredBanks.length > 0 && (
                        <div className="absolute z-20 mt-1 w-full overflow-auto rounded-xl border border-zinc-200 bg-white shadow-lg max-h-48">
                          {filteredBanks.map((bank) => (
                            <button
                              key={bank.code}
                              type="button"
                              onClick={() => {
                                setSelectedBank(bank);
                                setSearch(bank.name);
                                setDropdownOpen(false);
                                setResolvedName("");
                                setResolveError("");
                              }}
                              className="w-full px-4 py-2.5 text-left text-sm text-zinc-700 hover:bg-zinc-50 transition-colors first:rounded-t-xl last:rounded-b-xl"
                            >
                              {bank.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Account number */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                      Account number
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={10}
                        value={accountNumber}
                        onChange={(e) => {
                          const v = e.target.value.replace(/\D/g, "");
                          setAccountNumber(v);
                          setResolvedName("");
                          setResolveError("");
                        }}
                        placeholder="0123456789"
                        className="flex-1 rounded-xl border border-zinc-200 px-4 py-3 font-mono text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-shadow"
                      />
                      <button
                        type="button"
                        onClick={resolveAccount}
                        disabled={!canVerify}
                        className="rounded-xl bg-zinc-100 px-4 py-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
                      >
                        {resolving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify"}
                      </button>
                    </div>
                  </div>

                  {resolvedName && (
                    <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                      <div>
                        <p className="text-xs text-emerald-700">Account verified</p>
                        <p className="text-sm font-semibold text-emerald-800">{resolvedName}</p>
                      </div>
                    </div>
                  )}

                  {resolveError && <p className="text-xs text-red-500">{resolveError}</p>}
                </>
              )}

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSaveBank}
                  disabled={!hasVerified || bankStatus === "saving"}
                  className="flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 disabled:opacity-60"
                >
                  {bankStatus === "saving" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {bankStatus === "saving" ? "Connecting…" : "Connect Paystack"}
                </button>
                {paystackEnabled && (
                  <button
                    type="button"
                    onClick={() => setShowBankForm(false)}
                    className="text-xs text-zinc-400 hover:text-zinc-700 transition-colors"
                  >
                    Cancel
                  </button>
                )}
                {bankStatus === "saved" && <span className="text-xs text-emerald-600">Connected!</span>}
                {bankStatus === "error" && <span className="text-xs text-red-500">{bankError}</span>}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
