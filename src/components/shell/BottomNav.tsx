"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, TrendingUp, Trophy, Swords, CalendarDays } from "lucide-react";

const items = [
  { href: "/lobby", label: "Lobby", icon: Home },
  { href: "/props", label: "Props", icon: TrendingUp },
  { href: "/pools", label: "Pools", icon: Trophy },
  { href: "/h2h", label: "H2H", icon: Swords },
  { href: "/fixtures", label: "Fixtures", icon: CalendarDays },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto">
      <div className="bg-nav-bg backdrop-blur-xl border-t border-border-base px-4 py-2 flex justify-between items-center h-[72px] pb-4">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 px-2 ${
                active ? "text-text-main" : "text-text-muted"
              }`}
            >
              <Icon size={22} className={active ? "scale-110 transition-transform" : ""} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
