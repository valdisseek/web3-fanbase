import { NextRequest } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { joinPool, PoolError } from "@/lib/actions/pools";
import { InsufficientFundsError } from "@/lib/engine/money";
import { ok, fail } from "@/lib/api";

const schema = z.object({ lineup: z.array(z.number().int()).min(1).max(11) });

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return fail("Unauthorized", 401);
  const { id } = await params;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail("Invalid lineup");
  try {
    const entry = await joinPool(session.userId, id, parsed.data.lineup);
    return ok({ entryId: entry.id });
  } catch (e) {
    if (e instanceof InsufficientFundsError) return fail("Insufficient credits", 402);
    if (e instanceof PoolError) return fail(e.message);
    throw e;
  }
}
