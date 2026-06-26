"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { apiGet, fmtCredits } from "@/lib/client";

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

type Filter = "all" | "open" | "settled";

const statusColor: Record<string, string> = {
  PENDING: "text-text-muted",
  WON: "text-brand-blue",
  LOST: "text-brand-pink",
  VOID: "text-text-muted",
};

export function MyEntriesSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [slips, setSlips] = useState<Slip[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    apiGet<{ slips: Slip[] }>("/api/bets")
      .then((d) => setSlips(d.slips))
      .finally(() => setLoading(false));
  }, [open]);

  if (!open) return null;

  const shown = slips.filter((s) =>
    filter === "all"
      ? true
      : filter === "open"
      ? s.status === "PENDING"
      : s.status !== "PENDING",
  );

  const pills: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "open", label: "Open" },
    { key: "settled", label: "Settled" },
  ];

  return (
    <div className="fixed inset-0 z-50 max-w-md mx-auto bg-app-bg flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-base">
        <h2 className="font-extrabold text-lg">My Entries</h2>
        <button onClick={onClose} aria-label="Close entries" className="text-text-muted">
          <X size={22} />
        </button>
      </div>

      <div className="flex gap-2 px-4 py-3">
        {pills.map((p) => (
          <button
            key={p.key}
            onClick={() => setFilter(p.key)}
            className={`rounded-full px-3 py-1 text-xs font-bold border ${
              filter === p.key
                ? "bg-brand-blue/15 border-brand-blue text-brand-blue"
                : "bg-card-bg border-border-base text-text-muted"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-3">
        {loading && <p className="text-text-muted text-sm">Loading…</p>}
        {!loading && shown.length === 0 && (
          <p className="text-text-muted text-sm">No bets yet.</p>
        )}
        {shown.map((s) => (
          <div key={s.id} className="bg-card-bg border border-border-base rounded-xl p-3">
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
                <span className="text-brand-blue">Won {fmtCredits(s.payout ?? 0)} cr</span>
              ) : s.status === "PENDING" ? (
                <span className="text-text-muted">Potential {fmtCredits(s.potentialPayout)} cr</span>
              ) : s.status === "VOID" ? (
                <span className="text-text-muted">Refunded {fmtCredits(s.payout ?? 0)} cr</span>
              ) : (
                <span className="text-brand-pink">Lost</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
