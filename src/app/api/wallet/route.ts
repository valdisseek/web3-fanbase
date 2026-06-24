import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, fail } from "@/lib/api";

export async function GET() {
  const session = await getSession();
  if (!session) return fail("Unauthorized", 401);

  const account = await prisma.creditAccount.findUnique({
    where: { userId: session.userId },
    include: { entries: { orderBy: { createdAt: "desc" }, take: 50 } },
  });
  if (!account) return ok({ balance: 0, entries: [] });

  return ok({
    balance: account.balance,
    entries: account.entries.map((e) => ({
      id: e.id,
      amount: e.amount,
      type: e.type,
      refType: e.refType,
      createdAt: e.createdAt,
    })),
  });
}
