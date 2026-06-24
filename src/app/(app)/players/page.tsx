import { prisma } from "@/lib/db";
import { GlassCard } from "@/components/ui/GlassCard";

export const dynamic = "force-dynamic";

const POS: Record<number, string> = { 1: "GKP", 2: "DEF", 3: "MID", 4: "FWD" };

export default async function PlayersPage() {
  const players = await prisma.player.findMany({
    where: { status: "a" },
    include: { team: true },
    orderBy: { totalPoints: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">Players</h1>
      <p className="text-text-muted text-sm">Top performers (real FPL data)</p>
      <GlassCard className="!p-3">
        <div className="space-y-1">
          {players.map((p, i) => (
            <div key={p.id} className="flex items-center justify-between text-sm">
              <span>
                <span className="text-text-muted mr-2 w-6 inline-block">{i + 1}.</span>
                <span className="font-medium">{p.webName}</span>{" "}
                <span className="text-text-muted text-xs">
                  {p.team.shortName} · {POS[p.elementType]}
                </span>
              </span>
              <span className="text-text-muted">{p.totalPoints} pts</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
