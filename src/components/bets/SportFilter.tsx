"use client";

// The Bets-only sports selector (the Draftea sport row). Football carries the
// real FPL markets; the rest are forward-looking placeholders ("coming soon")
// until markets exist for them.
export interface Sport {
  key: string;
  label: string;
  icon: string;
  available: boolean;
}

export const SPORTS: Sport[] = [
  { key: "football", label: "Football", icon: "⚽", available: true },
  { key: "nfl", label: "Am. Football", icon: "🏈", available: false },
  { key: "basketball", label: "NBA", icon: "🏀", available: false },
  { key: "baseball", label: "MLB", icon: "⚾", available: false },
  { key: "tennis", label: "Tennis", icon: "🎾", available: false },
  { key: "hockey", label: "Hockey", icon: "🏒", available: false },
  { key: "cricket", label: "Cricket", icon: "🏏", available: false },
  { key: "mma", label: "MMA", icon: "🥊", available: false },
];

export function SportFilter({
  active,
  onSelect,
}: {
  active: string;
  onSelect: (key: string) => void;
}) {
  return (
    <div className="flex gap-4 px-4 pt-3 pb-1 overflow-x-auto">
      {SPORTS.map((s) => {
        const isActive = active === s.key;
        return (
          <button
            key={s.key}
            onClick={() => onSelect(s.key)}
            className="flex flex-col items-center gap-1 flex-none"
          >
            <span className="relative">
              <span
                className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl border-2 transition-colors ${
                  isActive
                    ? "border-brand-blue bg-brand-blue/15"
                    : "border-border-base bg-card-bg"
                } ${s.available ? "" : "opacity-70"}`}
              >
                {s.icon}
              </span>
              {!s.available && (
                <span className="absolute -bottom-0.5 -right-0.5 text-[7px] font-bold uppercase bg-card-bg border border-border-base text-text-muted rounded px-1 py-px">
                  Soon
                </span>
              )}
            </span>
            <span
              className={`text-[10px] whitespace-nowrap ${
                isActive ? "text-text-main font-semibold" : "text-text-muted"
              }`}
            >
              {s.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
