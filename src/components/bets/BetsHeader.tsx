"use client";

import Link from "next/link";
import { HelpCircle, Plus, Ticket } from "lucide-react";
import { BalancePill } from "@/components/shell/BalancePill";

export function BetsHeader({ onOpenEntries }: { onOpenEntries: () => void }) {
  return (
    <header className="flex items-center justify-between px-4 py-3 bg-nav-bg backdrop-blur-xl border-b border-border-base sticky top-0 z-40">
      <Link href="/bets" className="font-extrabold text-lg">
        Fan<span className="text-brand-blue">base</span>
      </Link>
      <div className="flex items-center gap-2.5">
        <span className="flex flex-col items-center text-[9px] text-text-muted" aria-hidden>
          <HelpCircle size={18} />
          Help
        </span>
        <BalancePill />
        <Link
          href="/wallet"
          aria-label="Add funds"
          className="w-8 h-8 rounded-full bg-brand-blue flex items-center justify-center text-white"
        >
          <Plus size={18} />
        </Link>
        <button
          onClick={onOpenEntries}
          aria-label="My entries"
          className="w-8 h-8 rounded-full bg-card-bg border border-border-base flex items-center justify-center text-text-main"
        >
          <Ticket size={16} />
        </button>
      </div>
    </header>
  );
}
