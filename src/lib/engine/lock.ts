import { prisma } from "@/lib/db";
import { transfer } from "@/lib/engine/money";
import { ensureHouse } from "@/lib/house";
import {
  MarketStatus,
  PoolStatus,
  H2HStatus,
  LedgerType,
} from "@/lib/constants";

/**
 * Lock all open products for any gameweek whose deadline has passed.
 * Unaccepted (OPEN) H2H challenges are voided and the creator's stake refunded.
 * Idempotent: only OPEN/ACCEPTED rows are touched.
 */
export async function lockExpired(now: Date = new Date()) {
  const expired = await prisma.gameweek.findMany({
    where: { deadlineTime: { lte: now } },
    select: { id: true },
  });
  const gwIds = expired.map((g) => g.id);
  if (gwIds.length === 0) return { markets: 0, pools: 0, h2hLocked: 0, h2hVoided: 0 };

  const markets = await prisma.propMarket.updateMany({
    where: { gameweekId: { in: gwIds }, status: MarketStatus.OPEN },
    data: { status: MarketStatus.LOCKED },
  });

  const pools = await prisma.pool.updateMany({
    where: { gameweekId: { in: gwIds }, status: PoolStatus.OPEN },
    data: { status: PoolStatus.LOCKED },
  });

  const h2hLocked = await prisma.h2HChallenge.updateMany({
    where: { gameweekId: { in: gwIds }, status: H2HStatus.ACCEPTED },
    data: { status: H2HStatus.LOCKED },
  });

  // Void unaccepted challenges and refund creators.
  const orphans = await prisma.h2HChallenge.findMany({
    where: { gameweekId: { in: gwIds }, status: H2HStatus.OPEN },
  });
  for (const c of orphans) {
    await prisma.$transaction(async (tx) => {
      const house = await ensureHouse(tx);
      const acct = await tx.creditAccount.findUniqueOrThrow({
        where: { userId: c.creatorId },
      });
      await transfer(tx, {
        fromAccountId: house,
        toAccountId: acct.id,
        amount: c.stake,
        type: LedgerType.REFUND,
        refType: "H2HChallenge",
        refId: c.id,
        idempotencyKey: `h2h:${c.id}:void`,
      });
      await tx.h2HChallenge.update({
        where: { id: c.id },
        data: { status: H2HStatus.VOID },
      });
    });
  }

  return {
    markets: markets.count,
    pools: pools.count,
    h2hLocked: h2hLocked.count,
    h2hVoided: orphans.length,
  };
}
