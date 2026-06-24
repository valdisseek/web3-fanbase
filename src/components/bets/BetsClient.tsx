"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Zap } from "lucide-react";
import type { MarketRow } from "@/lib/marketRows";
import type { FixtureChip } from "@/lib/betsView";
import { apiGet, apiPost, fmtCredits } from "@/lib/client";
import { BetsHeader } from "./BetsHeader";
import { PositionFilter } from "./PositionFilter";
import { FixtureChips } from "./FixtureChips";
import { BetTabs, type TabKey } from "./BetTabs";
import { MarketSection } from "./MarketSection";
import { PropCard, type Pick } from "./PropCard";
import { BetSlipBar, type Leg } from "./BetSlipBar";
import { MyEntriesSheet } from "./MyEntriesSheet";

const POPULAR_COUNT = 10;

export function BetsClient({
  gwName,
  fixtures,
  hasGameweek,
  displayName = "",
}: {
  gwName: string;
  fixtures: FixtureChip[];
  hasGameweek: boolean;
  displayName?: string;
}) {
  const [markets, setMarkets] = useState<MarketRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabKey>("popular");
  const [query, setQuery] = useState("");
  const [fixtureId, setFixtureId] = useState<number | null>(null);
  const [position, setPosition] = useState<number | null>(null);
  const [legs, setLegs] = useState<Leg[]>([]);
  const [stake, setStake] = useState(100);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [entriesOpen, setEntriesOpen] = useState(false);

  useEffect(() => {
    apiGet<{ markets: MarketRow[] }>("/api/markets")
      .then((d) => setMarkets(d.markets))
      .catch((e) => setMessage(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  // Filtering by position category + fixture chip + search, regardless of tab.
  const base = useMemo(() => {
    let list = markets;
    if (position != null) list = list.filter((m) => m.position === position);
    if (fixtureId != null) list = list.filter((m) => m.fixtureId === fixtureId);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (m) => m.player.toLowerCase().includes(q) || m.team.toLowerCase().includes(q),
      );
    }
    return list;
  }, [markets, position, fixtureId, query]);

  const popular = useMemo(() => base.slice(0, POPULAR_COUNT), [base]);

  // Group for "By Match": fixtureId -> rows, with a label from the first row.
  const groups = useMemo(() => {
    const map = new Map<string, { label: string; rows: MarketRow[] }>();
    for (const m of base) {
      const key = m.fixtureId != null ? String(m.fixtureId) : "other";
      const label = m.opponent
        ? m.isHome
          ? `${m.team} vs ${m.opponent}`
          : `${m.opponent} vs ${m.team}`
        : "Other";
      if (!map.has(key)) map.set(key, { label, rows: [] });
      map.get(key)!.rows.push(m);
    }
    return [...map.values()];
  }, [base]);

  function pickOf(marketId: string): Pick | null {
    const leg = legs.find((l) => l.marketId === marketId);
    return leg ? leg.pick : null;
  }

  function onPick(m: MarketRow, pick: Pick) {
    setLegs((prev) => {
      const without = prev.filter((l) => l.marketId !== m.id);
      const existing = prev.find((l) => l.marketId === m.id);
      if (existing && existing.pick === pick) return without; // toggle off
      const multiplier = pick === "OVER" ? m.overMultiplier : m.underMultiplier;
      return [...without, { marketId: m.id, player: m.player, line: m.line, pick, multiplier }];
    });
  }

  function onRemove(marketId: string) {
    setLegs((prev) => prev.filter((l) => l.marketId !== marketId));
  }

  async function onPlace() {
    setBusy(true);
    setMessage(null);
    try {
      const combined = legs.reduce((m, l) => m * l.multiplier, 1);
      await apiPost("/api/bets", {
        stake,
        legs: legs.map((l) => ({ marketId: l.marketId, pick: l.pick })),
      });
      setMessage(`Bet placed! Potential ${fmtCredits(Math.floor(stake * combined))} cr.`);
      setLegs([]);
      window.dispatchEvent(new Event("focus")); // refresh balance pill
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-app-bg">
      <BetsHeader onOpenEntries={() => setEntriesOpen(true)} displayName={displayName} />
      <PositionFilter active={position} onSelect={setPosition} />
      <FixtureChips fixtures={fixtures} activeFixtureId={fixtureId} onSelect={setFixtureId} />
      <BetTabs active={tab} onChange={setTab} query={query} onQuery={setQuery} />

      <div className="px-4 pt-3 pb-28">
        {loading && <p className="text-text-muted text-sm">Loading markets…</p>}

        {!loading && !hasGameweek && (
          <div className="bg-card-bg border border-border-base rounded-xl p-4 text-sm text-text-muted">
            No active gameweek. Open a demo gameweek from the{" "}
            <Link href="/wallet" className="text-brand-blue">Wallet</Link> /{" "}
            <Link href="/lobby" className="text-brand-blue">demo controls</Link>.
          </div>
        )}

        {!loading && hasGameweek && base.length === 0 && (
          <p className="text-text-muted text-sm">No markets match your filters.</p>
        )}

        {!loading && tab === "popular" && base.length > 0 && (
          <>
            <MarketSection
              title={
                <>
                  <Zap size={12} className="text-brand-blue" /> Promos
                </>
              }
            >
              <PropCard
                variant="featured"
                market={popular[0]}
                gwName={gwName}
                selected={pickOf(popular[0].id)}
                onPick={onPick}
              />
            </MarketSection>

            {popular.length > 1 && (
              <MarketSection title="🔥 Popular" badges={[gwName]}>
                <div className="grid grid-cols-2 gap-2.5">
                  {popular.slice(1).map((m) => (
                    <PropCard
                      key={m.id}
                      market={m}
                      gwName={gwName}
                      selected={pickOf(m.id)}
                      onPick={onPick}
                    />
                  ))}
                </div>
              </MarketSection>
            )}
          </>
        )}

        {!loading && tab === "all" && base.length > 0 && (
          <MarketSection title="All players" badges={[gwName]}>
            <div className="grid grid-cols-2 gap-2.5">
              {base.map((m) => (
                <PropCard
                  key={m.id}
                  market={m}
                  gwName={gwName}
                  selected={pickOf(m.id)}
                  onPick={onPick}
                />
              ))}
            </div>
          </MarketSection>
        )}

        {!loading && tab === "match" && (
          <div>
            {groups.map((g) => (
              <MarketSection key={g.label} title={g.label} badges={["90'"]}>
                <div className="grid grid-cols-2 gap-2.5">
                  {g.rows.map((m) => (
                    <PropCard
                      key={m.id}
                      market={m}
                      gwName={gwName}
                      selected={pickOf(m.id)}
                      onPick={onPick}
                    />
                  ))}
                </div>
              </MarketSection>
            ))}
          </div>
        )}
      </div>

      <BetSlipBar
        legs={legs}
        stake={stake}
        busy={busy}
        message={message}
        onStake={setStake}
        onRemove={onRemove}
        onPlace={onPlace}
      />

      <MyEntriesSheet open={entriesOpen} onClose={() => setEntriesOpen(false)} />
    </div>
  );
}
