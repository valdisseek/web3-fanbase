import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getNextGameweek } from "@/lib/markets";
import { ok } from "@/lib/api";

export async function GET(req: NextRequest) {
  const gwParam = req.nextUrl.searchParams.get("gw");
  let gameweekId = gwParam ? Number(gwParam) : null;
  if (!gameweekId) {
    const gw = await getNextGameweek();
    gameweekId = gw?.id ?? null;
  }

  const pools = await prisma.pool.findMany({
    where: gameweekId ? { gameweekId } : {},
    include: { _count: { select: { entries: true } } },
    orderBy: { entryFee: "asc" },
  });

  return ok({
    gameweekId,
    pools: pools.map((p) => ({
      id: p.id,
      name: p.name,
      format: p.format,
      entryFee: p.entryFee,
      rakeBps: p.rakeBps,
      maxEntries: p.maxEntries,
      minEntries: p.minEntries,
      entrants: p._count.entries,
      status: p.status,
    })),
  });
}
