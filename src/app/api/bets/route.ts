import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { placeSlip, BetError } from "@/lib/actions/bets";
import { InsufficientFundsError } from "@/lib/engine/money";
import { LegPick } from "@/lib/constants";
import { ok, fail } from "@/lib/api";

const schema = z.object({
  stake: z.number().int().positive(),
  legs: z
    .array(z.object({ marketId: z.string(), pick: z.enum([LegPick.OVER, LegPick.UNDER]) }))
    .min(1),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return fail("Unauthorized", 401);
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail("Invalid bet");
  try {
    const slip = await placeSlip(session.userId, parsed.data.legs, BigInt(parsed.data.stake));
    return ok({
      id: slip.id,
      stake: slip.stake,
      combinedMultiplier: slip.combinedMultiplier,
      potentialPayout: slip.potentialPayout,
      status: slip.status,
    });
  } catch (e) {
    if (e instanceof InsufficientFundsError) return fail("Insufficient credits", 402);
    if (e instanceof BetError) return fail(e.message);
    throw e;
  }
}

export async function GET() {
  const session = await getSession();
  if (!session) return fail("Unauthorized", 401);
  const slips = await prisma.betSlip.findMany({
    where: { userId: session.userId },
    include: { legs: { include: { market: { include: { player: true } } } } },
    orderBy: { createdAt: "desc" },
  });
  return ok({
    slips: slips.map((s) => ({
      id: s.id,
      stake: s.stake,
      combinedMultiplier: s.combinedMultiplier,
      potentialPayout: s.potentialPayout,
      status: s.status,
      payout: s.payout,
      createdAt: s.createdAt,
      legs: s.legs.map((l) => ({
        player: l.market.player.webName,
        pick: l.pick,
        line: l.line,
        multiplier: l.multiplier,
        result: l.result,
        resultPoints: l.market.resultPoints,
      })),
    })),
  });
}
