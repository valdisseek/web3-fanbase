"use client";

import { Search } from "lucide-react";

export type TabKey = "popular" | "match" | "all";

const TABS: { key: TabKey; label: string }[] = [
  { key: "popular", label: "Popular" },
  { key: "match", label: "By Match" },
  { key: "all", label: "All Players" },
];

export function BetTabs({
  active,
  onChange,
  query,
  onQuery,
}: {
  active: TabKey;
  onChange: (t: TabKey) => void;
  query: string;
  onQuery: (q: string) => void;
}) {
  return (
    <div className="flex gap-4 px-4 items-center border-b border-border-base">
      {TABS.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={`py-2.5 text-[13px] font-bold relative ${
            active === t.key ? "text-text-main" : "text-text-muted"
          }`}
        >
          {t.label}
          {active === t.key && (
            <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-brand-blue rounded" />
          )}
        </button>
      ))}
      <div className="ml-auto flex items-center gap-1.5 text-text-muted">
        <Search size={14} />
        <input
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Search players"
          className="bg-transparent text-xs outline-none w-24 text-text-main placeholder:text-text-muted"
        />
      </div>
    </div>
  );
}
