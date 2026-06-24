"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BalancePill } from "@/components/shell/BalancePill";
import { BottomNav } from "@/components/shell/BottomNav";
import { LogoutButton } from "@/components/shell/LogoutButton";

const PROTO = /^\/(leagues|fantasy|explore|more)(\/|$)/;

export function AppShell({
  displayName,
  children,
}: {
  displayName: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // Prototype sections (Leagues/Fantasy/Explore/More) render exactly as the
  // original zip: no global header, no extra padding (each view brings its own).
  const isProto = PROTO.test(pathname);

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col border-x border-border-base bg-app-bg transition-colors duration-300">
      {!isProto && (
        <header className="sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-nav-bg backdrop-blur-xl border-b border-border-base">
          <Link href="/lobby" className="font-extrabold text-lg">
            Fan<span className="text-brand-purple">base</span>
          </Link>
          <div className="flex items-center gap-3">
            <BalancePill />
            <span className="text-sm text-text-muted hidden sm:inline">{displayName}</span>
            <LogoutButton />
          </div>
        </header>
      )}
      <main className={isProto ? "flex-1 pb-24" : "flex-1 pb-24 px-4 pt-4 animate-fade-in"}>
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
