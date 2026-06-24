import type { Prisma } from "@prisma/client";

export const HOUSE_ACCOUNT_ID = "house";

/** Ensure the singleton house account exists within a transaction. */
export async function ensureHouse(tx: Prisma.TransactionClient): Promise<string> {
  await tx.creditAccount.upsert({
    where: { id: HOUSE_ACCOUNT_ID },
    update: {},
    create: { id: HOUSE_ACCOUNT_ID, isHouse: true, balance: 0n },
  });
  return HOUSE_ACCOUNT_ID;
}
