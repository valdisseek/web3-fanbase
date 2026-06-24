"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet, apiPost, fmtCredits } from "@/lib/client";
import { GlassCard } from "@/components/ui/GlassCard";
import { PlayerPicker } from "@/components/PlayerPicker";

interface Pool {
  id: string;
  name: string;
  format: string;
  entryFee: number;
  rakeBps: number;
  maxEntries: number;
  entrants: number;
  status: string;
}

export default function PoolsPage() {
  const [pools, setPools] = useState<Pool[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [lineup, setLineup] = useState<number[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  function load() {
    apiGet<{ pools: Pool[] }>("/api/pools")
      .then((d) => setPools(d.pools))
      .finally(() => setLoading(false));
  }
  useEffect(load, []);

  async function join(id: string) {
    setBusy(true);
    setMsg(null);
    try {
      await apiPost(`/api/pools/${id}/join`, { lineup });
      setMsg("Joined pool!");
      setOpenId(null);
      setLineup([]);
      load();
      window.dispatchEvent(new Event("focus"));
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">Prize Pools</h1>
      <p className="text-text-muted text-sm">
        Pay to enter, build a lineup, top finishers split the pot. House takes the rake.
      </p>

      {loading && <p className="text-text-muted text-sm">Loading…</p>}
      {!loading && pools.length === 0 && (
        <p className="text-text-muted text-sm">
          No pools. Open a gameweek from the{" "}
          <Link href="/lobby" className="text-brand-purple">Lobby</Link>.
        </p>
      )}

      {pools.map((p) => (
        <GlassCard key={p.id}>
          <div className="flex items-center justify-between">
            <div>
              <Link href={`/pools/${p.id}`} className="font-semibold hover:text-brand-purple">
                {p.name}
              </Link>
              <div className="text-xs text-text-muted">
                {p.format} · {p.entrants}/{p.maxEntries} entrants · rake {p.rakeBps / 100}%
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold">
                {p.entryFee === 0 ? "Free" : `${fmtCredits(p.entryFee)} cr`}
              </div>
              {p.status === "OPEN" ? (
                <button
                  onClick={() => {
                    setOpenId(openId === p.id ? null : p.id);
                    setLineup([]);
                  }}
                  className="text-xs text-brand-purple"
                >
                  {openId === p.id ? "Cancel" : "Join"}
                </button>
              ) : (
                <span className="text-xs text-text-muted">{p.status}</span>
              )}
            </div>
          </div>

          {openId === p.id && (
            <div className="mt-3 border-t border-border-base pt-3">
              <p className="text-xs text-text-muted mb-2">Pick up to 11 players:</p>
              <PlayerPicker max={11} selected={lineup} onChange={setLineup} />
              <button
                disabled={busy || lineup.length === 0}
                onClick={() => join(p.id)}
                className="mt-3 w-full rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 py-2 text-sm font-semibold disabled:opacity-50"
              >
                Enter for {p.entryFee === 0 ? "free" : `${fmtCredits(p.entryFee)} cr`}
              </button>
            </div>
          )}
        </GlassCard>
      ))}

      {msg && <p className="text-sm text-brand-teal">{msg}</p>}
    </div>
  );
}
