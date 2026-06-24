import Link from "next/link";
import { TrendingUp, Trophy, Swords } from "lucide-react";
import { prisma } from "@/lib/db";
import { getNextGameweek } from "@/lib/markets";
import { GlassCard } from "@/components/ui/GlassCard";
import { DemoControls } from "@/components/DemoControls";

export const dynamic = "force-dynamic";

export default async function LobbyPage() {
  const gw = await getNextGameweek();
  const [markets, pools, openH2H] = await Promise.all([
    gw ? prisma.propMarket.count({ where: { gameweekId: gw.id, status: "OPEN" } }) : 0,
    gw ? prisma.pool.count({ where: { gameweekId: gw.id } }) : 0,
    prisma.h2HChallenge.count({ where: { status: "OPEN" } }),
  ]);

  const cards = [
    { href: "/props", label: "Player Props", desc: `${markets} markets open`, icon: TrendingUp, color: "text-brand-teal" },
    { href: "/pools", label: "Prize Pools", desc: `${pools} pools`, icon: Trophy, color: "text-brand-purple" },
    { href: "/h2h", label: "Head-to-Head", desc: `${openH2H} open challenges`, icon: Swords, color: "text-brand-pink" },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-extrabold">Lobby</h1>
        <p className="text-text-muted text-sm">
          {gw ? `${gw.name} — betting open` : "No active gameweek. Run demo setup below."}
        </p>
      </div>

      <div className="grid gap-3">
        {cards.map(({ href, label, desc, icon: Icon, color }) => (
          <Link key={href} href={href}>
            <GlassCard className="flex items-center gap-4 hover:border-brand-purple transition-colors">
              <Icon size={28} className={color} />
              <div>
                <div className="font-semibold">{label}</div>
                <div className="text-text-muted text-sm">{desc}</div>
              </div>
            </GlassCard>
          </Link>
        ))}
      </div>

      <GlassCard>
        <div className="text-sm font-semibold mb-1">Demo controls</div>
        <p className="text-xs text-text-muted mb-3">
          FPL is off-season, so this opens a real finished gameweek as a betting
          demo. Place bets, then finalize to settle and pay out (house keeps the rake).
        </p>
        <DemoControls />
      </GlassCard>

      <div className="flex gap-3 text-sm">
        <Link href="/wallet" className="text-brand-purple">Wallet & ledger →</Link>
        <Link href="/players" className="text-brand-purple">Players →</Link>
      </div>
    </div>
  );
}
