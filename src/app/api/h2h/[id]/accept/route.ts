import { NextRequest } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { acceptChallenge, H2HError } from "@/lib/actions/h2h";
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
    const c = await acceptChallenge(session.userId, id, parsed.data.lineup);
    return ok({ id: c.id, status: c.status });
  } catch (e) {
    if (e instanceof InsufficientFundsError) return fail("Insufficient credits", 402);
    if (e instanceof H2HError) return fail(e.message);
    throw e;
  }
}
