import { prisma } from "@/lib/db";
import type { Player } from "@prisma/client";
import { priceProp } from "@/lib/engine/pricing";
import { GameweekStatus, MarketStatus } from "@/lib/constants";

/** The gameweek we open markets/contests against: the earliest UPCOMING one. */
export async function getNextGameweek() {
  return prisma.gameweek.findFirst({
    where: { status: GameweekStatus.UPCOMING },
    orderBy: { deadlineTime: "asc" },
  });
}

/**
 * Projected points for a player for one gameweek. Uses FPL's ep_next when the
 * season is live; off-season (ep_next == 0) it falls back to the player's
 * season average so markets and demos remain meaningful year-round.
 */
export function projectedPoints(p: Player): number {
  if (p.epNext > 0) return p.epNext;
  if (p.totalPoints > 0) return p.totalPoints / 38;
  return 0;
}

/**
 * Create one OPEN prop market per eligible player for the next gameweek.
 * Idempotent: the unique (playerId, gameweekId) constraint means re-running
 * only refreshes the line/odds for still-OPEN markets.
 */
export async function generateMarketsForNextGw(limit = 200) {
  const gw = await getNextGameweek();
  if (!gw) return { created: 0, gameweekId: null as number | null };

  // Order by a projection that works in-season (epNext) and off-season
  // (season total). Take a generous slice, then keep those with a real line.
  const candidates = await prisma.player.findMany({
    where: { status: "a" },
    orderBy: [{ epNext: "desc" }, { totalPoints: "desc" }],
    take: limit * 3,
  });
  const players = candidates
    .filter((p) => projectedPoints(p) > 0.5)
    .slice(0, limit);

  let created = 0;
  for (const p of players) {
    const price = priceProp(projectedPoints(p));
    const existing = await prisma.propMarket.findUnique({
      where: { playerId_gameweekId: { playerId: p.id, gameweekId: gw.id } },
    });
    if (existing) {
      if (existing.status === MarketStatus.OPEN) {
        await prisma.propMarket.update({
          where: { id: existing.id },
          data: {
            line: price.line,
            overMultiplier: price.overMultiplier,
            underMultiplier: price.underMultiplier,
          },
        });
      }
      continue;
    }
    await prisma.propMarket.create({
      data: {
        playerId: p.id,
        gameweekId: gw.id,
        line: price.line,
        overMultiplier: price.overMultiplier,
        underMultiplier: price.underMultiplier,
      },
    });
    created++;
  }
  return { created, gameweekId: gw.id };
}
