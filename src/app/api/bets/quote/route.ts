import { NextRequest } from "next/server";
import { z } from "zod";
import { quoteSlip, BetError } from "@/lib/actions/bets";
import { LegPick } from "@/lib/constants";
import { ok, fail } from "@/lib/api";

const schema = z.object({
  stake: z.number().int().positive(),
  legs: z
    .array(z.object({ marketId: z.string(), pick: z.enum([LegPick.OVER, LegPick.UNDER]) }))
    .min(1),
});

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail("Invalid quote request");
  try {
    const q = await quoteSlip(parsed.data.legs, BigInt(parsed.data.stake));
    return ok(q);
  } catch (e) {
    if (e instanceof BetError) return fail(e.message);
    throw e;
  }
}
