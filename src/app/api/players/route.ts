import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { ok } from "@/lib/api";

const POS: Record<number, string> = { 1: "GKP", 2: "DEF", 3: "MID", 4: "FWD" };

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.toLowerCase();
  const take = Number(req.nextUrl.searchParams.get("take") ?? 60);

  const players = await prisma.player.findMany({
    where: q ? { webName: { contains: q } } : { status: "a" },
    include: { team: true },
    orderBy: { totalPoints: "desc" },
    take: Math.min(take, 200),
  });

  return ok({
    players: players.map((p) => ({
      id: p.id,
      name: p.webName,
      team: p.team.shortName,
      position: POS[p.elementType] ?? "?",
      totalPoints: p.totalPoints,
    })),
  });
}
