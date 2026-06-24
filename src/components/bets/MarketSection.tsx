"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export function MarketSection({
  title,
  badges = [],
  defaultOpen = true,
  children,
}: {
  title: React.ReactNode;
  badges?: string[];
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="mb-5">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between mb-2"
      >
        <span className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 bg-card-bg border border-border-base rounded-full px-3 py-1 text-xs font-bold text-text-main">
            {title}
          </span>
          {badges.map((b) => (
            <span
              key={b}
              className="text-[9px] font-bold text-brand-blue bg-brand-blue/10 border border-brand-blue/30 rounded px-1.5 py-0.5"
            >
              {b}
            </span>
          ))}
        </span>
        <span className="text-text-muted">
          {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </span>
      </button>
      {open && children}
    </section>
  );
}
