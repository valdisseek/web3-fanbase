import { prisma } from "@/lib/db";
import { syncLive } from "@/lib/fpl/sync";
import { generateMarketsForNextGw } from "@/lib/markets";
import { GameweekStatus, PoolFormat, PoolStatus, HOUSE_RAKE_BPS } from "@/lib/constants";

/**
 * DEV/DEMO ONLY. The FPL API serves the finished season during the off-season,
 * so there is no naturally-UPCOMING gameweek to bet on. This converts a real
 * finished gameweek into a betting-open "demo" gameweek: it syncs that GW's real
 * per-player points (used later for settlement), reopens it as UPCOMING with a
 * future deadline, generates prop markets, and seeds demo pools.
 */
export async function ensureDemoGameweek(gameweekId?: number) {
  // If a real UPCOMING gameweek already exists, use it as-is.
  const existingUpcoming = await prisma.gameweek.findFirst({
    where: { status: GameweekStatus.UPCOMING },
    orderBy: { deadlineTime: "asc" },
  });
  let gwId = existingUpcoming?.id;

  if (!gwId) {
    // Pick the most recent finished gameweek with real fixtures.
    const candidate =
      (await prisma.gameweek.findUnique({ where: { id: gameweekId ?? -1 } })) ??
      (await prisma.gameweek.findFirst({ orderBy: { id: "desc" } }));
    if (!candidate) throw new Error("No gameweeks synced; run FPL sync first.");
    gwId = candidate.id;

    // Sync real per-player points for this GW so settlement has truth data.
    await syncLive(gwId);

    const deadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.gameweek.update({
      where: { id: gwId },
      data: {
        status: GameweekStatus.UPCOMING,
        deadlineTime: deadline,
        finished: false,
        dataChecked: false,
      },
    });
  }

  const markets = await generateMarketsForNextGw();
  const pools = await seedDemoPools(gwId);
  return { gameweekId: gwId, marketsCreated: markets.created, poolsCreated: pools.created };
}

/**
 * DEV/DEMO ONLY. Force a gameweek to "finalized" so the full settlement
 * lifecycle can be demonstrated without waiting for real kickoffs: moves the
 * deadline into the past, marks it FINALIZED + dataChecked, then locks and
 * settles. Real GW points were already synced by ensureDemoGameweek.
 */
export async function finalizeDemoGameweek(gameweekId: number) {
  const { lockExpired } = await import("@/lib/engine/lock");
  const { settleGameweek } = await import("@/lib/engine/settle");

  await prisma.gameweek.update({
    where: { id: gameweekId },
    data: {
      deadlineTime: new Date(Date.now() - 60_000),
      status: GameweekStatus.FINALIZED,
      finished: true,
      dataChecked: true,
    },
  });
  const locked = await lockExpired();
  const settled = await settleGameweek(gameweekId);
  return { locked, settled };
}

export async function seedDemoPools(gameweekId: number) {
  const specs = [
    { name: "Free Roll GW", format: PoolFormat.GPP, entryFee: 0n, maxEntries: 100, minEntries: 2 },
    { name: "100cr Double-Up", format: PoolFormat.DOUBLE_UP, entryFee: 100n, maxEntries: 50, minEntries: 2 },
    { name: "500cr GPP Jackpot", format: PoolFormat.GPP, entryFee: 500n, maxEntries: 50, minEntries: 2 },
  ];
  let created = 0;
  for (const s of specs) {
    const exists = await prisma.pool.findFirst({
      where: { gameweekId, name: s.name },
    });
    if (exists) continue;
    await prisma.pool.create({
      data: {
        name: s.name,
        gameweekId,
        format: s.format,
        entryFee: s.entryFee,
        rakeBps: HOUSE_RAKE_BPS,
        maxEntries: s.maxEntries,
        minEntries: s.minEntries,
        status: PoolStatus.OPEN,
      },
    });
    created++;
  }
  return { created };
}
