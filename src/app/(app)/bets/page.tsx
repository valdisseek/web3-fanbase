import { prisma } from "@/lib/db";
import { getNextGameweek } from "@/lib/markets";
import { buildFixtureChips, type FixtureForChips } from "@/lib/betsView";
import { BetsClient } from "@/components/bets/BetsClient";

export const dynamic = "force-dynamic";

export default async function BetsPage() {
  const gw = await getNextGameweek();

  let chips: ReturnType<typeof buildFixtureChips> = [];
  if (gw) {
    const [fixtures, teams] = await Promise.all([
      prisma.fixture.findMany({ where: { gameweekId: gw.id } }),
      prisma.team.findMany(),
    ]);
    const teamShortById: Record<number, string> = {};
    for (const t of teams) teamShortById[t.id] = t.shortName;
    const forChips: FixtureForChips[] = fixtures.map((f) => ({
      id: f.id,
      teamHId: f.teamHId,
      teamAId: f.teamAId,
      started: f.started,
      finished: f.finished,
    }));
    chips = buildFixtureChips(forChips, teamShortById);
  }

  return <BetsClient gwName={gw?.name ?? "GW"} fixtures={chips} hasGameweek={!!gw} />;
}
