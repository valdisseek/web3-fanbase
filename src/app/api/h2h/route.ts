import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { createChallenge, H2HError } from "@/lib/actions/h2h";
import { InsufficientFundsError } from "@/lib/engine/money";
import { H2HMetric, H2HStatus } from "@/lib/constants";
import { ok, fail } from "@/lib/api";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return fail("Unauthorized", 401);
  const filter = req.nextUrl.searchParams.get("filter") ?? "open";

  const where =
    filter === "mine"
      ? { OR: [{ creatorId: session.userId }, { opponentId: session.userId }] }
      : { status: H2HStatus.OPEN, creatorId: { not: session.userId } };

  const challenges = await prisma.h2HChallenge.findMany({
    where,
    include: {
      creator: { select: { displayName: true } },
      opponent: { select: { displayName: true } },
    },
    orderBy: { id: "desc" },
    take: 100,
  });

  return ok({
    challenges: challenges.map((c) => ({
      id: c.id,
      creator: c.creator.displayName,
      opponent: c.opponent?.displayName ?? null,
      metric: c.metric,
      stake: c.stake,
      status: c.status,
      gameweekId: c.gameweekId,
      winnerId: c.winnerId,
      isMine: c.creatorId === session.userId,
    })),
  });
}

const createSchema = z.object({
  gameweekId: z.number().int(),
  metric: z.enum([H2HMetric.LINEUP_TOTAL, H2HMetric.SINGLE_PLAYER]),
  lineup: z.array(z.number().int()).min(1).max(11),
  stake: z.number().int().positive(),
  opponentId: z.string().optional().nullable(),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return fail("Unauthorized", 401);
  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail("Invalid challenge");
  try {
    const c = await createChallenge(session.userId, {
      gameweekId: parsed.data.gameweekId,
      metric: parsed.data.metric,
      lineup: parsed.data.lineup,
      stake: BigInt(parsed.data.stake),
      opponentId: parsed.data.opponentId,
    });
    return ok({ id: c.id, status: c.status });
  } catch (e) {
    if (e instanceof InsufficientFundsError) return fail("Insufficient credits", 402);
    if (e instanceof H2HError) return fail(e.message);
    throw e;
  }
}
