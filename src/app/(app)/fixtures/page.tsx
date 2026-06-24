import { prisma } from "@/lib/db";
import { GlassCard } from "@/components/ui/GlassCard";

export const dynamic = "force-dynamic";

export default async function FixturesPage() {
  const gw = await prisma.gameweek.findFirst({
    where: { status: { in: ["UPCOMING", "LIVE"] } },
    orderBy: { deadlineTime: "asc" },
  });
  const targetGw =
    gw ?? (await prisma.gameweek.findFirst({ orderBy: { id: "desc" } }));

  const teams = await prisma.team.findMany();
  const teamName = new Map(teams.map((t) => [t.id, t.shortName]));

  const fixtures = targetGw
    ? await prisma.fixture.findMany({
        where: { gameweekId: targetGw.id },
        orderBy: { kickoffTime: "asc" },
      })
    : [];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">Fixtures</h1>
      <p className="text-text-muted text-sm">{targetGw?.name ?? "No gameweek"}</p>

      <div className="space-y-2">
        {fixtures.map((f) => (
          <GlassCard key={f.id} className="!p-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold w-16 text-right">
                {teamName.get(f.teamHId) ?? f.teamHId}
              </span>
              <span className="text-text-muted text-sm">
                {f.finished && f.teamHScore !== null
                  ? `${f.teamHScore} - ${f.teamAScore}`
                  : f.kickoffTime
                    ? new Date(f.kickoffTime).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })
                    : "TBD"}
              </span>
              <span className="font-semibold w-16">{teamName.get(f.teamAId) ?? f.teamAId}</span>
            </div>
          </GlassCard>
        ))}
        {fixtures.length === 0 && (
          <p className="text-text-muted text-sm">No fixtures synced.</p>
        )}
      </div>
    </div>
  );
}
