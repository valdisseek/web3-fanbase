"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet, fmtCredits } from "@/lib/client";
import { GlassCard } from "@/components/ui/GlassCard";

interface Leg {
  player: string;
  pick: string;
  line: number;
  multiplier: number;
  result: string;
  resultPoints: number | null;
}
interface Slip {
  id: string;
  stake: number;
  combinedMultiplier: number;
  potentialPayout: number;
  status: string;
  payout: number | null;
  legs: Leg[];
}

const statusColor: Record<string, string> = {
  PENDING: "text-text-muted",
  WON: "text-brand-teal",
  LOST: "text-brand-pink",
  VOID: "text-text-muted",
};

export default function MyBetsPage() {
  const [slips, setSlips] = useState<Slip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<{ slips: Slip[] }>("/api/bets")
      .then((d) => setSlips(d.slips))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">My Bets</h1>
        <Link href="/props" className="text-sm text-brand-purple">
          ← Props
        </Link>
      </div>

      {loading && <p className="text-text-muted text-sm">Loading…</p>}
      {!loading && slips.length === 0 && (
        <p className="text-text-muted text-sm">No bets yet.</p>
      )}

      {slips.map((s) => (
        <GlassCard key={s.id} className="!p-3">
          <div className="flex items-center justify-between mb-2">
            <span className={`font-semibold ${statusColor[s.status]}`}>{s.status}</span>
            <span className="text-sm text-text-muted">
              {fmtCredits(s.stake)} cr · ×{s.combinedMultiplier.toFixed(2)}
            </span>
          </div>
          <div className="space-y-1">
            {s.legs.map((l, i) => (
              <div key={i} className="text-xs flex justify-between">
                <span>
                  {l.player} {l.pick} {l.line}
                  {l.resultPoints !== null && (
                    <span className="text-text-muted"> (scored {l.resultPoints})</span>
                  )}
                </span>
                <span className={statusColor[l.result] ?? "text-text-muted"}>{l.result}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 text-sm">
            {s.status === "WON" ? (
              <span className="text-brand-teal">Won {fmtCredits(s.payout ?? 0)} cr</span>
            ) : s.status === "PENDING" ? (
              <span className="text-text-muted">
                Potential {fmtCredits(s.potentialPayout)} cr
              </span>
            ) : s.status === "VOID" ? (
              <span className="text-text-muted">Refunded {fmtCredits(s.payout ?? 0)} cr</span>
            ) : (
              <span className="text-brand-pink">Lost</span>
            )}
          </div>
        </GlassCard>
      ))}
    </div>
  );
}
