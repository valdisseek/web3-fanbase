"use client";

import type { FixtureChip } from "@/lib/betsView";

export function FixtureChips({
  fixtures,
  activeFixtureId,
  onSelect,
}: {
  fixtures: FixtureChip[];
  activeFixtureId: number | null;
  onSelect: (id: number | null) => void;
}) {
  const base =
    "flex-none rounded-[10px] px-2.5 py-1.5 text-[11px] whitespace-nowrap border transition-colors";
  return (
    <div className="flex gap-2 px-4 pb-2.5 overflow-x-auto">
      <button
        onClick={() => onSelect(null)}
        className={`${base} ${
          activeFixtureId === null
            ? "bg-brand-blue/15 border-brand-blue text-brand-blue font-bold"
            : "bg-card-bg border-border-base text-text-muted"
        }`}
      >
        All
      </button>
      {fixtures.map((f) => (
        <button
          key={f.id}
          onClick={() => onSelect(f.id)}
          className={`${base} ${
            activeFixtureId === f.id
              ? "bg-brand-blue/15 border-brand-blue text-brand-blue font-bold"
              : f.live
              ? "bg-card-bg border-red-500/40 text-text-main"
              : "bg-card-bg border-border-base text-text-main"
          }`}
        >
          {f.label}
          {f.live && <span className="ml-1 text-red-500 font-bold">LIVE</span>}
        </button>
      ))}
    </div>
  );
}
