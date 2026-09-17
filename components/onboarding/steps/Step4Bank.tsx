"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, CheckCircle2, ShieldCheck } from "lucide-react";
import type { WizardData } from "../OnboardingWizard";

interface Bank {
  name: string;
  code: string;
}

interface Props {
  data: WizardData;
  onNext: (data: Partial<WizardData>) => void;
  onBack: () => void;
}

export function Step4Bank({ data, onNext, onBack }: Props) {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [banksLoading, setBanksLoading] = useState(true);
  const [banksError, setBanksError] = useState(false);

  const [search, setSearch] = useState(data.bankDisplayName || "");
  const [selectedBank, setSelectedBank] = useState<Bank | null>(
    data.bankCode ? { code: data.bankCode, name: data.bankDisplayName } : null
  );
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [accountNumber, setAccountNumber] = useState(data.bankAccountNumber || "");
  const [resolvedName, setResolvedName] = useState(data.bankAccountName || "");
  const [resolving, setResolving] = useState(false);
  const [resolveError, setResolveError] = useState("");

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/banks")
      .then((r) => r.json())
      .then((d) => {
        if (d.data) setBanks(d.data);
        else setBanksError(true);
      })
      .catch(() => setBanksError(true))
      .finally(() => setBanksLoading(false));
  }, []);

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
        setResolveError(d.error ?? "Could not verify this account. Check the details and try again.");
      }
    } catch {
      setResolveError("Network error — please try again.");
    } finally {
      setResolving(false);
    }
  }

  function handleSkip() {
    onNext({
      bankCode: "",
      bankAccountNumber: "",
      bankAccountName: "",
      bankDisplayName: "",
    });
  }

  function handleContinue() {
    if (!selectedBank || !accountNumber || !resolvedName) {
      // If they've entered nothing, allow skip
      handleSkip();
      return;
    }
    onNext({
      bankCode: selectedBank.code,
      bankAccountNumber: accountNumber,
      bankAccountName: resolvedName,
      bankDisplayName: selectedBank.name,
    });
  }

  const canVerify = !!selectedBank && accountNumber.length === 10 && !resolving;
  const hasVerified = !!resolvedName;
  const hasBankData = !!selectedBank && !!accountNumber;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-bold text-zinc-900">Add your bank account</h2>
        <p className="text-sm text-zinc-500 mt-1">
          Payments go straight to your bank — we never hold your money.
        </p>
      </div>

      <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-100 rounded-xl p-3">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <p className="text-xs text-emerald-700">
          Your bank details are used only for Paystack settlement. We never store your BVN or
          password.
        </p>
      </div>

      {banksLoading && (
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading banks…
        </div>
      )}

      {banksError && (
        <div className="text-sm text-zinc-500 bg-zinc-50 rounded-xl p-4 border border-zinc-100">
          Could not load bank list. You can skip this step and add your bank later in Settings.
        </div>
      )}

      {!banksLoading && !banksError && (
        <div className="space-y-4">
          {/* Bank search */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">Bank</label>
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
                placeholder="Search your bank..."
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 text-sm transition-shadow"
              />
              {dropdownOpen && filteredBanks.length > 0 && (
                <div className="absolute z-20 mt-1 w-full bg-white border border-zinc-200 rounded-xl shadow-lg max-h-48 overflow-auto">
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
                      className="w-full text-left px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors first:rounded-t-xl last:rounded-b-xl"
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
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">Account number</label>
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
                className="flex-1 px-4 py-3 rounded-xl border border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 font-mono text-sm transition-shadow"
              />
              <button
                type="button"
                onClick={resolveAccount}
                disabled={!canVerify}
                className="px-4 py-3 bg-zinc-100 text-zinc-700 text-sm font-semibold rounded-xl hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
              >
                {resolving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify"}
              </button>
            </div>
          </div>

          {/* Resolved name */}
          {resolvedName && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-4 py-3 rounded-xl">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <p className="text-xs text-emerald-700">Account verified</p>
                <p className="text-sm font-semibold text-emerald-800">{resolvedName}</p>
              </div>
            </div>
          )}

          {resolveError && (
            <p className="text-xs text-red-500">{resolveError}</p>
          )}
        </div>
      )}

      <div className="space-y-2">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 py-3 px-4 border border-zinc-200 text-zinc-700 text-sm font-semibold rounded-xl hover:bg-zinc-50 transition-colors"
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleContinue}
            disabled={hasBankData && !hasVerified}
            className="flex-[2] py-3 px-4 bg-zinc-900 text-white text-sm font-semibold rounded-xl hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors active:scale-[0.98]"
          >
            {hasVerified ? "Continue" : hasBankData ? "Verify first" : "Continue"}
          </button>
        </div>
        <button
          type="button"
          onClick={handleSkip}
          className="w-full text-center text-xs text-zinc-400 hover:text-zinc-600 py-1 transition-colors"
        >
          Skip for now — add bank later in Settings
        </button>
      </div>
    </div>
  );
}
