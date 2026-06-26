"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Ticket, Trophy, Shirt, Compass, MoreHorizontal } from "lucide-react";

export function BottomNav() {
  const pathname = usePathname();

  const bettingActive = pathname.startsWith("/bets") || pathname.startsWith("/lobby");
  const leaguesActive = pathname.startsWith("/leagues");
  const fantasyActive = pathname.startsWith("/fantasy");
  const exploreActive = pathname.startsWith("/explore");
  const moreActive = pathname.startsWith("/more");

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto">
      <div className="bg-nav-bg backdrop-blur-xl border-t border-border-base px-4 py-2 flex justify-between items-center h-[84px] pb-6 transition-colors duration-300">
        <NavButton href="/bets" icon={<Ticket size={22} />} label="Bets" isActive={bettingActive} />
        <NavButton href="/leagues" icon={<Trophy size={22} />} label="Leagues" isActive={leaguesActive} />
        <NavButton href="/fantasy" icon={<Shirt size={22} />} label="Fantasy" isActive={fantasyActive} />
        <NavButton href="/explore" icon={<Compass size={22} />} label="Explore" isActive={exploreActive} />
        <NavButton href="/more" icon={<MoreHorizontal size={22} />} label="More" isActive={moreActive} />
      </div>
    </nav>
  );
}

function NavButton({
  href,
  icon,
  label,
  isActive,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center gap-1 transition-colors"
    >
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${
          isActive
            ? "bg-white text-app-bg shadow-lg"
            : "text-text-muted"
        }`}
      >
        {icon}
      </div>
      <span
        className={`text-[10px] font-medium transition-colors ${
          isActive ? "text-text-main" : "text-text-muted"
        }`}
      >
        {label}
      </span>
    </Link>
  );
}
