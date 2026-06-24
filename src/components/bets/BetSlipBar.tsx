"use client";

import { X } from "lucide-react";
import { fmtCredits } from "@/lib/client";

export interface Leg {
  marketId: string;
  player: string;
  line: number;
  pick: "OVER" | "UNDER";
  multiplier: number;
}

export function BetSlipBar({
  legs,
  stake,
  busy,
  message,
  onStake,
  onRemove,
  onPlace,
}: {
  legs: Leg[];
  stake: number;
  busy: boolean;
  message: string | null;
  onStake: (n: number) => void;
  onRemove: (marketId: string) => void;
  onPlace: () => void;
}) {
  if (legs.length === 0) return null;

  const combined = legs.reduce((m, l) => m * l.multiplier, 1);
  const potential = Math.floor(stake * combined);

  return (
    <div className="fixed bottom-[72px] left-0 right-0 max-w-md mx-auto px-3 z-40">
      <div className="bg-card-bg border border-brand-blue rounded-2xl p-3 shadow-glass">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-sm">
            Bet slip · {legs.length} {legs.length === 1 ? "leg" : "legs"}
          </span>
          <span className="text-brand-blue font-bold text-sm">×{combined.toFixed(2)}</span>
        </div>

        <div className="space-y-1 mb-3 max-h-24 overflow-y-auto">
          {legs.map((l) => (
            <div key={l.marketId} className="text-xs text-text-muted flex justify-between items-center">
              <span>{l.player} {l.pick} {l.line} · ×{l.multiplier.toFixed(2)}</span>
              <button onClick={() => onRemove(l.marketId)} aria-label={`Remove ${l.player}`}>
                <X size={14} />
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="number"
            min={1}
            value={stake}
            onChange={(e) => onStake(Math.max(1, Number(e.target.value)))}
            className="w-24 rounded-lg bg-app-bg border border-border-base px-3 py-2 text-sm outline-none"
          />
          <button
            onClick={onPlace}
            disabled={busy}
            className="flex-1 rounded-lg bg-gradient-to-tr from-blue-500 to-blue-600 py-2 text-sm font-bold disabled:opacity-50"
          >
            Place · win {fmtCredits(potential)}
          </button>
        </div>

        {message && <p className="text-xs text-brand-blue mt-2">{message}</p>}
      </div>
    </div>
  );
}
