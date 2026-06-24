import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const HOUSE_ACCOUNT_ID = "house";
const GRANT = 10_000n;

async function grant(accountId: string, amount: bigint) {
  await prisma.$transaction(async (tx) => {
    const acct = await tx.creditAccount.findUniqueOrThrow({ where: { id: accountId } });
    await tx.creditAccount.update({
      where: { id: accountId },
      data: { balance: acct.balance + amount, version: { increment: 1 } },
    });
    await tx.ledgerEntry.create({
      data: { accountId, amount, type: "GRANT" },
    });
  });
}

async function ensureUser(email: string, displayName: string, password: string) {
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, displayName, passwordHash },
  });
  const acct = await prisma.creditAccount.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id, balance: 0n },
  });
  // Grant starting credits only if the account is empty (idempotent reseed).
  const existing = await prisma.ledgerEntry.count({ where: { accountId: acct.id } });
  if (existing === 0) await grant(acct.id, GRANT);
  return user;
}

async function main() {
  // House account (no user).
  await prisma.creditAccount.upsert({
    where: { id: HOUSE_ACCOUNT_ID },
    update: {},
    create: { id: HOUSE_ACCOUNT_ID, isHouse: true, balance: 0n },
  });

  await ensureUser("alice@example.com", "Alice", "password123");
  await ensureUser("bob@example.com", "Bob", "password123");

  console.log("Seed complete: HOUSE + alice/bob (password123), 10,000 credits each.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
