"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Ticket, Trophy, Shirt, Compass, MoreHorizontal } from "lucide-react";

const PROTO = /^\/(bets|leagues|fantasy|explore|more)(\/|$)/;

export function BottomNav() {
  const pathname = usePathname();
  const isProto = PROTO.test(pathname);

  const bettingActive = pathname.startsWith("/bets") || pathname.startsWith("/lobby");
  const leaguesActive = pathname.startsWith("/leagues");
  const fantasyActive = pathname.startsWith("/fantasy");
  const exploreActive = pathname.startsWith("/explore");
  const moreActive = pathname.startsWith("/more");

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto">
      <div className="bg-nav-bg backdrop-blur-xl border-t border-border-base px-6 py-2 flex justify-between items-center h-[84px] pb-6 transition-colors duration-300">
        <NavButton href="/bets" icon={<Ticket size={24} />} label="Bets" isActive={bettingActive} />
        <NavButton href="/leagues" icon={<Trophy size={24} />} label="Leagues" isActive={leaguesActive} />

        {/* Floating Action Button for Fantasy */}
        <div className="relative -top-5 flex flex-col items-center">
          <Link
            href="/fantasy"
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 mb-1 ${
              fantasyActive
                ? "bg-gradient-to-tr from-blue-500 to-blue-600 text-white scale-110 shadow-glow"
                : "bg-card-bg border border-border-base text-text-muted hover:text-text-main hover:border-text-main"
            }`}
          >
            <Shirt size={24} />
          </Link>
          <span
            className={`text-[10px] font-medium transition-colors ${
              fantasyActive ? "text-text-main" : "text-text-muted"
            }`}
          >
            Fantasy
          </span>
        </div>

        <NavButton href="/explore" icon={<Compass size={24} />} label="Explore" isActive={exploreActive} />
        <NavButton href="/more" icon={<MoreHorizontal size={24} />} label="More" isActive={moreActive} />
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
      className={`flex flex-col items-center justify-center gap-1 transition-colors ${
        isActive ? "text-text-main" : "text-text-muted hover:text-text-main"
      }`}
    >
      <div className={`transition-transform duration-200 ${isActive ? "scale-110" : ""}`}>{icon}</div>
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  );
}
