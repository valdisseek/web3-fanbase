"use client";

import { Trophy } from "lucide-react";
import { POSITIONS } from "./positions";

export function PositionFilter({
  active,
  onSelect,
}: {
  active: number | null;
  onSelect: (pos: number | null) => void;
}) {
  return (
    <div className="flex gap-4 px-4 pt-3 pb-1 overflow-x-auto">
      {POSITIONS.map((p) => {
        const isActive = active === p.value;
        return (
          <button
            key={p.label}
            onClick={() => onSelect(p.value)}
            className="flex flex-col items-center gap-1 flex-none"
          >
            <span
              className={`w-14 h-14 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                isActive
                  ? "border-brand-blue bg-brand-blue/15 text-brand-blue"
                  : "border-border-base bg-card-bg text-text-muted"
              }`}
            >
              {p.value === null ? <Trophy size={20} /> : p.label}
            </span>
            <span
              className={`text-[10px] ${
                isActive ? "text-text-main font-semibold" : "text-text-muted"
              }`}
            >
              {p.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
