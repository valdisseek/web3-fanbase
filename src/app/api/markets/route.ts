import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getNextGameweek } from "@/lib/markets";
import { MarketStatus } from "@/lib/constants";
import { ok } from "@/lib/api";

export async function GET(req: NextRequest) {
  const gwParam = req.nextUrl.searchParams.get("gw");
  let gameweekId = gwParam ? Number(gwParam) : null;
  if (!gameweekId) {
    const gw = await getNextGameweek();
    gameweekId = gw?.id ?? null;
  }
  if (!gameweekId) return ok({ gameweekId: null, markets: [] });

  const markets = await prisma.propMarket.findMany({
    where: { gameweekId, status: MarketStatus.OPEN },
    include: { player: { include: { team: true } } },
    orderBy: { line: "desc" },
    take: 200,
  });

  return ok({
    gameweekId,
    markets: markets.map((m) => ({
      id: m.id,
      playerId: m.playerId,
      player: m.player.webName,
      team: m.player.team.shortName,
      position: m.player.elementType,
      line: m.line,
      overMultiplier: m.overMultiplier,
      underMultiplier: m.underMultiplier,
    })),
  });
}
