import { prisma } from "@/lib/db";
import { ok, fail } from "@/lib/api";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const pool = await prisma.pool.findUnique({
    where: { id },
    include: {
      gameweek: true,
      entries: { include: { user: { select: { displayName: true } } } },
    },
  });
  if (!pool) return fail("Pool not found", 404);

  const entries = [...pool.entries].sort(
    (a, b) => (a.rank ?? 1e9) - (b.rank ?? 1e9) || (b.score ?? 0) - (a.score ?? 0),
  );

  return ok({
    pool: {
      id: pool.id,
      name: pool.name,
      format: pool.format,
      entryFee: pool.entryFee,
      rakeBps: pool.rakeBps,
      maxEntries: pool.maxEntries,
      minEntries: pool.minEntries,
      status: pool.status,
      gameweekId: pool.gameweekId,
      deadline: pool.gameweek.deadlineTime,
      entrants: pool.entries.length,
    },
    leaderboard: entries.map((e) => ({
      user: e.user.displayName,
      score: e.score,
      rank: e.rank,
      payout: e.payout,
    })),
  });
}
