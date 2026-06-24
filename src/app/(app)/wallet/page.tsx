"use client";

import { useEffect, useState } from "react";
import { apiGet, fmtCredits } from "@/lib/client";
import { GlassCard } from "@/components/ui/GlassCard";

interface Entry {
  id: string;
  amount: number;
  type: string;
  refType: string | null;
  createdAt: string;
}

export default function WalletPage() {
  const [balance, setBalance] = useState<number | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);

  useEffect(() => {
    apiGet<{ balance: number; entries: Entry[] }>("/api/wallet").then((d) => {
      setBalance(d.balance);
      setEntries(d.entries);
    });
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">Wallet</h1>
      <GlassCard className="text-center">
        <div className="text-text-muted text-sm">Balance</div>
        <div className="text-4xl font-extrabold mt-1">
          {balance === null ? "—" : fmtCredits(balance)}
          <span className="text-base text-text-muted font-normal ml-1">cr</span>
        </div>
        <div className="text-xs text-text-muted mt-1">Play-money credits</div>
      </GlassCard>

      <div>
        <h2 className="text-sm font-semibold mb-2">Recent activity</h2>
        <div className="space-y-1">
          {entries.length === 0 && <p className="text-text-muted text-sm">No activity yet.</p>}
          {entries.map((e) => (
            <div
              key={e.id}
              className="flex items-center justify-between rounded-lg bg-card-bg/40 border border-border-base px-3 py-2 text-sm"
            >
              <span>
                <span className="font-medium">{e.type}</span>
                {e.refType && <span className="text-text-muted text-xs"> · {e.refType}</span>}
              </span>
              <span className={e.amount >= 0 ? "text-brand-teal" : "text-brand-pink"}>
                {e.amount >= 0 ? "+" : ""}
                {fmtCredits(e.amount)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
