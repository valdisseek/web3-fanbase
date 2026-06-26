"use client";

import { BarChart2 } from "lucide-react";
import type { MarketRow } from "@/lib/marketRows";
import { PlayerHeadshot } from "./PlayerHeadshot";
import { positionLabel } from "./positions";

export type Pick = "OVER" | "UNDER";

function matchLabel(m: MarketRow): string {
  if (!m.opponent) return m.team;
  return m.isHome ? `${m.team} vs ${m.opponent}` : `${m.opponent} vs ${m.team}`;
}

function OuButton({
  dir,
  line,
  mult,
  active,
  onClick,
}: {
  dir: Pick;
  line: number;
  mult: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      aria-pressed={active}
      onClick={onClick}
      className={`flex-1 rounded-xl py-1.5 flex flex-col items-center gap-px text-xs font-bold border transition-colors ${
        active
          ? "bg-brand-blue/20 border-brand-blue text-brand-blue"
          : "bg-app-bg border-border-base text-text-main hover:border-text-muted"
      }`}
    >
      <span className="text-[8px] uppercase tracking-wide text-text-muted">
        {dir === "OVER" ? "Over" : "Under"} {line}
      </span>
      {mult.toFixed(2)}×
    </button>
  );
}

export function PropCard({
  market,
  gwName,
  selected,
  onPick,
  variant = "grid",
}: {
  market: MarketRow;
  gwName: string;
  selected: Pick | null;
  onPick: (market: MarketRow, pick: Pick) => void;
  variant?: "grid" | "featured";
}) {
  const over = (
    <OuButton
      dir="OVER"
      line={market.line}
      mult={market.overMultiplier}
      active={selected === "OVER"}
      onClick={() => onPick(market, "OVER")}
    />
  );
  const under = (
    <OuButton
      dir="UNDER"
      line={market.line}
      mult={market.underMultiplier}
      active={selected === "UNDER"}
      onClick={() => onPick(market, "UNDER")}
    />
  );

  if (variant === "featured") {
    return (
      <div className="bg-card-bg border border-brand-blue/40 rounded-2xl p-3 flex items-center gap-3">
        <div className="flex flex-col items-center flex-none">
          <span className="w-5 h-5 rounded-md bg-white/5 flex items-center justify-center text-text-muted mb-1">
            <BarChart2 size={11} />
          </span>
          <PlayerHeadshot code={market.code} name={market.player} size={56} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm flex items-center gap-1.5">
            <span className="truncate">{market.player}</span>
            <span className="text-[9px] text-text-muted uppercase tracking-wide flex-none">
              {positionLabel(market.position)}
            </span>
          </div>
          <div className="text-[11px] text-text-muted">Gameweek points</div>
          <div className="text-[10px] text-text-muted">
            {matchLabel(market)} · {gwName}
          </div>
          <div className="text-[11px] mt-0.5">
            Line <strong className="text-text-main">{market.line}</strong>
          </div>
        </div>
        <div className="flex-none w-28 flex gap-2">
          {over}
          {under}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card-bg border border-border-base rounded-2xl overflow-hidden">
      <div className="flex justify-between items-start px-2.5 pt-2">
        <span className="w-5 h-5 rounded-md bg-white/5 flex items-center justify-center text-text-muted">
          <BarChart2 size={11} />
        </span>
        <span className="text-right text-[9px] text-text-muted leading-tight">
          <span className="block">{matchLabel(market)}</span>
          <span className="block">{gwName}</span>
        </span>
      </div>

      <PlayerHeadshot code={market.code} name={market.player} size={84} />

      <div className="text-center px-2">
        <div className="font-bold text-sm leading-tight">{market.player}</div>
        <div className="text-[9px] text-text-muted uppercase tracking-wide">
          {positionLabel(market.position)}
        </div>
      </div>

      <div className="px-2 py-2 flex gap-2">
        {over}
        {under}
      </div>
    </div>
  );
}
