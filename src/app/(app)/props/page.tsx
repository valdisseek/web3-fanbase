"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiGet, apiPost, fmtCredits } from "@/lib/client";
import { GlassCard } from "@/components/ui/GlassCard";

interface Market {
  id: string;
  player: string;
  team: string;
  line: number;
  overMultiplier: number;
  underMultiplier: number;
}
type Pick = "OVER" | "UNDER";
interface Leg {
  marketId: string;
  player: string;
  line: number;
  pick: Pick;
  multiplier: number;
}

export default function PropsPage() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [legs, setLegs] = useState<Leg[]>([]);
  const [stake, setStake] = useState(100);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<{ markets: Market[] }>("/api/markets")
      .then((d) => setMarkets(d.markets))
      .catch((e) => setMsg(e.message))
      .finally(() => setLoading(false));
  }, []);

  const combined = useMemo(
    () => legs.reduce((m, l) => m * l.multiplier, 1),
    [legs],
  );
  const potential = Math.floor(stake * combined);

  function addLeg(m: Market, pick: Pick) {
    setLegs((prev) => {
      const without = prev.filter((l) => l.marketId !== m.id);
      const multiplier = pick === "OVER" ? m.overMultiplier : m.underMultiplier;
      // toggle off if same pick clicked again
      const existing = prev.find((l) => l.marketId === m.id);
      if (existing && existing.pick === pick) return without;
      return [...without, { marketId: m.id, player: m.player, line: m.line, pick, multiplier }];
    });
  }

  async function place() {
    setBusy(true);
    setMsg(null);
    try {
      await apiPost("/api/bets", {
        stake,
        legs: legs.map((l) => ({ marketId: l.marketId, pick: l.pick })),
      });
      setMsg(`Bet placed! Potential payout ${fmtCredits(potential)} cr.`);
      setLegs([]);
      window.dispatchEvent(new Event("focus")); // refresh balance pill
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Player Props</h1>
        <Link href="/props/my-bets" className="text-sm text-brand-purple">
          My bets →
        </Link>
      </div>
      <p className="text-text-muted text-sm">
        Bet over/under on a player&apos;s gameweek points. Combine picks into a parlay.
      </p>

      {loading && <p className="text-text-muted text-sm">Loading markets…</p>}
      {!loading && markets.length === 0 && (
        <GlassCard>
          <p className="text-sm text-text-muted">
            No open markets. Open a gameweek from the{" "}
            <Link href="/lobby" className="text-brand-purple">Lobby</Link>.
          </p>
        </GlassCard>
      )}

      <div className="space-y-2">
        {markets.map((m) => {
          const leg = legs.find((l) => l.marketId === m.id);
          return (
            <GlassCard key={m.id} className="!p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{m.player}</div>
                  <div className="text-xs text-text-muted">
                    {m.team} · line {m.line} pts
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => addLeg(m, "OVER")}
                    className={`rounded-lg px-3 py-2 text-sm font-medium border ${
                      leg?.pick === "OVER"
                        ? "bg-brand-teal/20 border-brand-teal"
                        : "border-border-base bg-card-bg/40"
                    }`}
                  >
                    O {m.overMultiplier}
                  </button>
                  <button
                    onClick={() => addLeg(m, "UNDER")}
                    className={`rounded-lg px-3 py-2 text-sm font-medium border ${
                      leg?.pick === "UNDER"
                        ? "bg-brand-pink/20 border-brand-pink"
                        : "border-border-base bg-card-bg/40"
                    }`}
                  >
                    U {m.underMultiplier}
                  </button>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Bet slip */}
      {legs.length > 0 && (
        <div className="fixed bottom-[72px] left-0 right-0 max-w-md mx-auto px-4">
          <GlassCard className="!bg-card-bg border-brand-purple">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">
                Bet slip · {legs.length} {legs.length === 1 ? "leg" : "legs"}
              </span>
              <span className="text-sm text-text-muted">×{combined.toFixed(2)}</span>
            </div>
            <div className="space-y-1 mb-3 max-h-24 overflow-y-auto">
              {legs.map((l) => (
                <div key={l.marketId} className="text-xs text-text-muted flex justify-between">
                  <span>
                    {l.player} {l.pick} {l.line}
                  </span>
                  <span>×{l.multiplier}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                value={stake}
                onChange={(e) => setStake(Math.max(1, Number(e.target.value)))}
                className="w-24 rounded-lg bg-app-bg border border-border-base px-3 py-2 text-sm outline-none"
              />
              <button
                onClick={place}
                disabled={busy}
                className="flex-1 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 py-2 text-sm font-semibold disabled:opacity-50"
              >
                Place · win {fmtCredits(potential)}
              </button>
            </div>
          </GlassCard>
        </div>
      )}

      {msg && <p className="text-sm text-brand-teal">{msg}</p>}
    </div>
  );
}
