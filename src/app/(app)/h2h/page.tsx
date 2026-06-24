"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet, apiPost, fmtCredits } from "@/lib/client";
import { GlassCard } from "@/components/ui/GlassCard";
import { PlayerPicker } from "@/components/PlayerPicker";

interface Challenge {
  id: string;
  creator: string;
  opponent: string | null;
  metric: string;
  stake: number;
  status: string;
  isMine: boolean;
}

export default function H2HPage() {
  const [tab, setTab] = useState<"open" | "mine" | "create">("open");
  const [open, setOpen] = useState<Challenge[]>([]);
  const [mine, setMine] = useState<Challenge[]>([]);
  const [gwId, setGwId] = useState<number | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  // create form
  const [metric, setMetric] = useState<"SINGLE_PLAYER" | "LINEUP_TOTAL">("SINGLE_PLAYER");
  const [lineup, setLineup] = useState<number[]>([]);
  const [stake, setStake] = useState(100);
  const [busy, setBusy] = useState(false);

  // accept form
  const [acceptId, setAcceptId] = useState<string | null>(null);
  const [acceptLineup, setAcceptLineup] = useState<number[]>([]);

  function load() {
    apiGet<{ challenges: Challenge[] }>("/api/h2h?filter=open").then((d) => setOpen(d.challenges));
    apiGet<{ challenges: Challenge[] }>("/api/h2h?filter=mine").then((d) => setMine(d.challenges));
    apiGet<{ gameweek: { id: number } | null }>("/api/gameweek").then((d) =>
      setGwId(d.gameweek?.id ?? null),
    );
  }
  useEffect(load, []);

  const maxPlayers = metric === "SINGLE_PLAYER" ? 1 : 11;

  async function create() {
    if (!gwId) return setMsg("No active gameweek");
    setBusy(true);
    setMsg(null);
    try {
      await apiPost("/api/h2h", { gameweekId: gwId, metric, lineup, stake });
      setMsg("Challenge created!");
      setLineup([]);
      setTab("mine");
      load();
      window.dispatchEvent(new Event("focus"));
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function accept(c: Challenge) {
    setBusy(true);
    setMsg(null);
    try {
      await apiPost(`/api/h2h/${c.id}/accept`, { lineup: acceptLineup });
      setMsg("Challenge accepted!");
      setAcceptId(null);
      setAcceptLineup([]);
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
      <h1 className="text-2xl font-extrabold">Head-to-Head</h1>
      <div className="flex gap-2">
        {(["open", "mine", "create"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg px-3 py-1.5 text-sm capitalize ${
              tab === t ? "bg-brand-purple text-white" : "bg-card-bg text-text-muted"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "open" && (
        <div className="space-y-2">
          {open.length === 0 && <p className="text-text-muted text-sm">No open challenges.</p>}
          {open.map((c) => (
            <GlassCard key={c.id} className="!p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{c.creator}</div>
                  <div className="text-xs text-text-muted">
                    {c.metric === "SINGLE_PLAYER" ? "Single player" : "Lineup total"} ·{" "}
                    {fmtCredits(c.stake)} cr
                  </div>
                </div>
                <button
                  onClick={() => {
                    setAcceptId(acceptId === c.id ? null : c.id);
                    setAcceptLineup([]);
                  }}
                  className="text-xs text-brand-purple"
                >
                  {acceptId === c.id ? "Cancel" : "Accept"}
                </button>
              </div>
              {acceptId === c.id && (
                <div className="mt-3 border-t border-border-base pt-3">
                  <p className="text-xs text-text-muted mb-2">
                    Pick your {c.metric === "SINGLE_PLAYER" ? "player" : "lineup"}:
                  </p>
                  <PlayerPicker
                    max={c.metric === "SINGLE_PLAYER" ? 1 : 11}
                    selected={acceptLineup}
                    onChange={setAcceptLineup}
                  />
                  <button
                    disabled={busy || acceptLineup.length === 0}
                    onClick={() => accept(c)}
                    className="mt-3 w-full rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 py-2 text-sm font-semibold disabled:opacity-50"
                  >
                    Accept for {fmtCredits(c.stake)} cr
                  </button>
                </div>
              )}
            </GlassCard>
          ))}
        </div>
      )}

      {tab === "mine" && (
        <div className="space-y-2">
          {mine.length === 0 && <p className="text-text-muted text-sm">No challenges yet.</p>}
          {mine.map((c) => (
            <GlassCard key={c.id} className="!p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">
                  {c.creator} vs {c.opponent ?? "—"}
                </span>
                <span className="text-xs text-text-muted">
                  {fmtCredits(c.stake)} cr · {c.status}
                </span>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {tab === "create" && (
        <GlassCard>
          <p className="text-xs text-text-muted mb-2">
            {gwId ? `Gameweek ${gwId}` : "No active gameweek — open one from the Lobby."}
          </p>
          <div className="flex gap-2 mb-3">
            {(["SINGLE_PLAYER", "LINEUP_TOTAL"] as const).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMetric(m);
                  setLineup([]);
                }}
                className={`rounded-lg px-3 py-1.5 text-xs ${
                  metric === m ? "bg-brand-purple text-white" : "bg-card-bg text-text-muted"
                }`}
              >
                {m === "SINGLE_PLAYER" ? "Single player" : "Lineup total"}
              </button>
            ))}
          </div>
          <PlayerPicker max={maxPlayers} selected={lineup} onChange={setLineup} />
          <div className="flex items-center gap-2 mt-3">
            <input
              type="number"
              min={1}
              value={stake}
              onChange={(e) => setStake(Math.max(1, Number(e.target.value)))}
              className="w-24 rounded-lg bg-app-bg border border-border-base px-3 py-2 text-sm outline-none"
            />
            <button
              disabled={busy || !gwId || lineup.length === 0}
              onClick={create}
              className="flex-1 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 py-2 text-sm font-semibold disabled:opacity-50"
            >
              Create challenge · {fmtCredits(stake)} cr
            </button>
          </div>
        </GlassCard>
      )}

      {msg && <p className="text-sm text-brand-teal">{msg}</p>}
      <Link href="/lobby" className="text-sm text-brand-purple block">
        ← Lobby
      </Link>
    </div>
  );
}
