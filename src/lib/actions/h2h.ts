import { prisma } from "@/lib/db";
import { transfer } from "@/lib/engine/money";
import { ensureHouse } from "@/lib/house";
import { ensureCreditAccount } from "@/lib/accounts";
import { H2HStatus, H2HMetric, LedgerType } from "@/lib/constants";

export class H2HError extends Error {}

function validateLineup(metric: H2HMetric, lineup: number[]) {
  if (!Array.isArray(lineup)) throw new H2HError("Lineup required");
  if (metric === H2HMetric.SINGLE_PLAYER && lineup.length !== 1) {
    throw new H2HError("Single-player challenge needs exactly one player");
  }
  if (metric === H2HMetric.LINEUP_TOTAL && (lineup.length < 1 || lineup.length > 11)) {
    throw new H2HError("Lineup must have 1-11 players");
  }
}

/** Create a challenge: debit creator stake -> house escrow. */
export async function createChallenge(
  creatorId: string,
  params: {
    gameweekId: number;
    metric: H2HMetric;
    lineup: number[];
    stake: bigint;
    opponentId?: string | null;
  },
  now = new Date(),
) {
  const { gameweekId, metric, lineup, stake, opponentId } = params;
  if (stake <= 0n) throw new H2HError("Stake must be positive");
  validateLineup(metric, lineup);
  const gw = await prisma.gameweek.findUnique({ where: { id: gameweekId } });
  if (!gw) throw new H2HError("Gameweek not found");
  if (gw.deadlineTime <= now) throw new H2HError("Gameweek deadline passed");

  const accountId = await ensureCreditAccount(creatorId);

  return prisma.$transaction(async (tx) => {
    const house = await ensureHouse(tx);
    await transfer(tx, {
      fromAccountId: accountId,
      toAccountId: house,
      amount: stake,
      type: LedgerType.STAKE,
      refType: "H2HChallenge",
    });
    return tx.h2HChallenge.create({
      data: {
        creatorId,
        opponentId: opponentId ?? null,
        gameweekId,
        metric,
        creatorLineup: JSON.stringify(lineup),
        stake,
        status: H2HStatus.OPEN,
      },
    });
  });
}

/** Accept an open challenge: debit opponent stake -> house escrow. */
export async function acceptChallenge(
  opponentId: string,
  challengeId: string,
  lineup: number[],
  now = new Date(),
) {
  const c = await prisma.h2HChallenge.findUnique({
    where: { id: challengeId },
    include: { gameweek: true },
  });
  if (!c) throw new H2HError("Challenge not found");
  if (c.status !== H2HStatus.OPEN) throw new H2HError("Challenge is not open");
  if (c.creatorId === opponentId) throw new H2HError("Cannot accept your own challenge");
  if (c.opponentId && c.opponentId !== opponentId) {
    throw new H2HError("This challenge is reserved for another player");
  }
  if (c.gameweek.deadlineTime <= now) throw new H2HError("Gameweek deadline passed");
  validateLineup(c.metric as H2HMetric, lineup);

  const accountId = await ensureCreditAccount(opponentId);

  return prisma.$transaction(async (tx) => {
    // Re-check still open inside tx.
    const fresh = await tx.h2HChallenge.findUniqueOrThrow({ where: { id: challengeId } });
    if (fresh.status !== H2HStatus.OPEN) throw new H2HError("Challenge is not open");
    const house = await ensureHouse(tx);
    await transfer(tx, {
      fromAccountId: accountId,
      toAccountId: house,
      amount: c.stake,
      type: LedgerType.STAKE,
      refType: "H2HChallenge",
      refId: c.id,
    });
    return tx.h2HChallenge.update({
      where: { id: challengeId },
      data: {
        opponentId,
        opponentLineup: JSON.stringify(lineup),
        status: H2HStatus.ACCEPTED,
      },
    });
  });
}
