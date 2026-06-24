import { prisma } from "@/lib/db";
import { transfer } from "@/lib/engine/money";
import { ensureHouse } from "@/lib/house";
import { ensureCreditAccount } from "@/lib/accounts";
import { PoolStatus, LedgerType } from "@/lib/constants";

export class PoolError extends Error {}

/** Join a pool: validate lineup, debit entry fee -> house, create entry. */
export async function joinPool(
  userId: string,
  poolId: string,
  lineup: number[],
  now = new Date(),
) {
  if (!Array.isArray(lineup) || lineup.length < 1 || lineup.length > 11) {
    throw new PoolError("Lineup must have 1-11 players");
  }
  const pool = await prisma.pool.findUnique({
    where: { id: poolId },
    include: { gameweek: true, _count: { select: { entries: true } } },
  });
  if (!pool) throw new PoolError("Pool not found");
  if (pool.status !== PoolStatus.OPEN) throw new PoolError("Pool is closed");
  if (pool.gameweek.deadlineTime <= now) throw new PoolError("Gameweek deadline passed");
  if (pool._count.entries >= pool.maxEntries) throw new PoolError("Pool is full");

  const dup = await prisma.poolEntry.findUnique({
    where: { poolId_userId: { poolId, userId } },
  });
  if (dup) throw new PoolError("Already entered this pool");

  // Validate players exist.
  const found = await prisma.player.count({ where: { id: { in: lineup } } });
  if (found !== lineup.length) throw new PoolError("Lineup contains unknown players");

  const accountId = await ensureCreditAccount(userId);

  return prisma.$transaction(async (tx) => {
    // Re-check capacity inside the tx to avoid races.
    const count = await tx.poolEntry.count({ where: { poolId } });
    if (count >= pool.maxEntries) throw new PoolError("Pool is full");

    if (pool.entryFee > 0n) {
      const house = await ensureHouse(tx);
      await transfer(tx, {
        fromAccountId: accountId,
        toAccountId: house,
        amount: pool.entryFee,
        type: LedgerType.STAKE,
        refType: "Pool",
        refId: pool.id,
      });
    }
    return tx.poolEntry.create({
      data: { poolId, userId, lineup: JSON.stringify(lineup) },
    });
  });
}
