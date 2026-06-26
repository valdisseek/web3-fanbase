import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getNextGameweek } from "@/lib/markets";
import { MarketStatus } from "@/lib/constants";
import { ok } from "@/lib/api";
import { buildMarketRows, type RawMarket } from "@/lib/marketRows";

export async function GET(req: NextRequest) {
  const gwParam = req.nextUrl.searchParams.get("gw");
  let gameweekId = gwParam ? Number(gwParam) : null;
  if (!gameweekId) {
    const gw = await getNextGameweek();
    gameweekId = gw?.id ?? null;
  }
  if (!gameweekId) return ok({ gameweekId: null, markets: [] });

  const [markets, fixtures, teams] = await Promise.all([
    prisma.propMarket.findMany({
      where: { gameweekId, status: MarketStatus.OPEN },
      include: { player: { include: { team: true } } },
      orderBy: { line: "desc" },
      take: 200,
    }),
    prisma.fixture.findMany({ where: { gameweekId } }),
    prisma.team.findMany(),
  ]);

  const teamShortById: Record<number, string> = {};
  for (const t of teams) teamShortById[t.id] = t.shortName;

  const raw: RawMarket[] = markets.map((m) => ({
    id: m.id,
    playerId: m.playerId,
    webName: m.player.webName,
    teamId: m.player.teamId,
    teamShort: m.player.team.shortName,
    elementType: m.player.elementType,
    line: m.line,
    overMultiplier: m.overMultiplier,
    underMultiplier: m.underMultiplier,
    code: m.player.code,
  }));

  return ok({
    gameweekId,
    markets: buildMarketRows(
      raw,
      fixtures.map((f) => ({
        id: f.id,
        teamHId: f.teamHId,
        teamAId: f.teamAId,
        started: f.started,
        finished: f.finished,
      })),
      teamShortById,
    ),
  });
}
