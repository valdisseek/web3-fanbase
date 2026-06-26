"use client";

import Link from "next/link";
import { Plus, Ticket, User } from "lucide-react";
import { BalancePill } from "@/components/shell/BalancePill";

export function BetsHeader({
  onOpenEntries,
  displayName = "",
}: {
  onOpenEntries: () => void;
  displayName?: string;
}) {
  return (
    <header className="flex items-center justify-between px-4 py-3 bg-nav-bg backdrop-blur-xl border-b border-border-base sticky top-0 z-40">
      <div className="flex items-center gap-2 min-w-0">
        <span className="w-9 h-9 rounded-full bg-card-bg border border-border-base flex items-center justify-center text-text-muted flex-none">
          <User size={18} />
        </span>
        <div className="leading-tight min-w-0">
          <Link href="/bets" className="font-extrabold text-base block truncate">
            Fan<span className="text-brand-blue">base</span>
          </Link>
          <div className="text-[10px] text-text-muted truncate">
            {displayName ? displayName : "Just now"}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-none">
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
