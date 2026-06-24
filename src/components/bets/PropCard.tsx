"use client";

import { BarChart2 } from "lucide-react";
import type { MarketRow } from "@/lib/marketRows";
import { PlayerHeadshot } from "./PlayerHeadshot";

export type Pick = "OVER" | "UNDER";

function matchLabel(m: MarketRow): string {
  if (!m.opponent) return m.team;
  return m.isHome ? `${m.team} vs ${m.opponent}` : `${m.opponent} vs ${m.team}`;
}

export function PropCard({
  market,
  gwName,
  selected,
  onPick,
}: {
  market: MarketRow;
  gwName: string;
  selected: Pick | null;
  onPick: (market: MarketRow, pick: Pick) => void;
}) {
  return (
    <div className="bg-card-bg border border-border-base rounded-2xl overflow-hidden">
      <div className="flex justify-between items-center px-2.5 pt-2 text-[9px] text-text-muted">
        <span className="w-5 h-5 rounded-md bg-white/5 flex items-center justify-center">
          <BarChart2 size={11} />
        </span>
        <span>{matchLabel(market)} · {gwName}</span>
      </div>

      <PlayerHeadshot code={market.code} name={market.player} size={92} />

      <div className="text-center font-bold text-sm px-2">{market.player}</div>
      <div className="text-center text-[10px] text-text-muted mt-0.5 mb-2">
        Line <strong className="text-text-main">{market.line} pts</strong>
      </div>

      <div className="mx-2 mb-2 flex border border-border-base rounded-xl overflow-hidden">
        <button
          aria-pressed={selected === "OVER"}
          onClick={() => onPick(market, "OVER")}
          className={`flex-1 py-1.5 flex flex-col items-center gap-px text-xs font-bold ${
            selected === "OVER" ? "bg-brand-blue/20 text-brand-blue" : "text-text-main"
          }`}
        >
          <span className="text-[8px] uppercase tracking-wide text-text-muted">
            Over {market.line}
          </span>
          {market.overMultiplier.toFixed(2)}×
        </button>
        <button
          aria-pressed={selected === "UNDER"}
          onClick={() => onPick(market, "UNDER")}
          className={`flex-1 py-1.5 flex flex-col items-center gap-px text-xs font-bold border-l border-border-base ${
            selected === "UNDER" ? "bg-brand-blue/20 text-brand-blue" : "text-text-main"
          }`}
        >
          <span className="text-[8px] uppercase tracking-wide text-text-muted">
            Under {market.line}
          </span>
          {market.underMultiplier.toFixed(2)}×
        </button>
      </div>
    </div>
  );
}
