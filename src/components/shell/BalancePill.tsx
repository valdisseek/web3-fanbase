"use client";

import { useEffect, useState } from "react";
import { Wallet } from "lucide-react";
import { apiGet, fmtCredits } from "@/lib/client";

export function BalancePill() {
  const [balance, setBalance] = useState<number | null>(null);

  async function load() {
    try {
      const data = await apiGet<{ balance: number }>("/api/wallet");
      setBalance(data.balance);
    } catch {
      setBalance(null);
    }
  }

  useEffect(() => {
    load();
    // Refresh when the tab regains focus (after placing a bet, etc.)
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  return (
    <div className="flex items-center gap-1.5 rounded-full bg-card-bg border border-border-base px-3 py-1.5 text-sm font-semibold">
      <Wallet size={15} className="text-brand-blue" />
      <span>{balance === null ? "—" : fmtCredits(balance)}</span>
      <span className="text-text-muted text-xs font-normal">cr</span>
    </div>
  );
}
