import { prisma } from "@/lib/db";

/** Ensure a user has a credit account; returns the account id. */
export async function ensureCreditAccount(userId: string): Promise<string> {
  const existing = await prisma.creditAccount.findUnique({ where: { userId } });
  if (existing) return existing.id;
  const created = await prisma.creditAccount.create({ data: { userId, balance: 0n } });
  return created.id;
}
