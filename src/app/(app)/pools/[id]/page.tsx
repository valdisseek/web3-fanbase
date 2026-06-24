"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { apiGet, fmtCredits } from "@/lib/client";
import { GlassCard } from "@/components/ui/GlassCard";

interface Detail {
  pool: {
    name: string;
    format: string;
    entryFee: number;
    rakeBps: number;
    entrants: number;
    status: string;
  };
  leaderboard: { user: string; score: number | null; rank: number | null; payout: number | null }[];
}

export default function PoolDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<Detail | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    apiGet<Detail>(`/api/pools/${id}`)
      .then(setData)
      .catch((e) => setErr(e.message));
  }, [id]);

  if (err) return <p className="text-brand-pink text-sm">{err}</p>;
  if (!data) return <p className="text-text-muted text-sm">Loading…</p>;

  return (
    <div className="space-y-4">
      <Link href="/pools" className="text-sm text-brand-purple">
        ← Pools
      </Link>
      <div>
        <h1 className="text-2xl font-extrabold">{data.pool.name}</h1>
        <p className="text-text-muted text-sm">
          {data.pool.format} · {data.pool.entrants} entrants ·{" "}
          {data.pool.entryFee === 0 ? "Free" : `${fmtCredits(data.pool.entryFee)} cr`} · rake{" "}
          {data.pool.rakeBps / 100}% · {data.pool.status}
        </p>
      </div>

      <GlassCard className="!p-3">
        <div className="text-sm font-semibold mb-2">Leaderboard</div>
        {data.leaderboard.length === 0 && (
          <p className="text-xs text-text-muted">No entries yet.</p>
        )}
        <div className="space-y-1">
          {data.leaderboard.map((e, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span>
                <span className="text-text-muted mr-2">{e.rank ?? i + 1}.</span>
                {e.user}
              </span>
              <span className="text-text-muted">
                {e.score ?? "—"} pts
                {e.payout ? <span className="text-brand-teal"> · +{fmtCredits(e.payout)}</span> : ""}
              </span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
