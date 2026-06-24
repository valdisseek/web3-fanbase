import { prisma } from "@/lib/db";
import { transfer } from "@/lib/engine/money";
import { ensureHouse } from "@/lib/house";
import { ensureCreditAccount } from "@/lib/accounts";
import { combinedMultiplier, payoutFor } from "@/lib/engine/parlay";
import { MarketStatus, LegPick, LedgerType } from "@/lib/constants";

export interface LegRequest {
  marketId: string;
  pick: LegPick;
}

export class BetError extends Error {}

async function loadLegs(legs: LegRequest[], now: Date) {
  if (!legs.length) throw new BetError("Bet slip needs at least one selection");
  const markets = await prisma.propMarket.findMany({
    where: { id: { in: legs.map((l) => l.marketId) } },
    include: { gameweek: true, player: true },
  });
  const byId = new Map(markets.map((m) => [m.id, m]));
  const resolved = legs.map((l) => {
    const m = byId.get(l.marketId);
    if (!m) throw new BetError(`Unknown market ${l.marketId}`);
    if (m.status !== MarketStatus.OPEN) throw new BetError(`Market closed: ${m.player.webName}`);
    if (m.gameweek.deadlineTime <= now) throw new BetError(`Gameweek deadline passed`);
    const multiplier = l.pick === LegPick.OVER ? m.overMultiplier : m.underMultiplier;
    return { market: m, pick: l.pick, line: m.line, multiplier };
  });
  return resolved;
}

/** Price a slip without committing it. */
export async function quoteSlip(legs: LegRequest[], stake: bigint, now = new Date()) {
  const resolved = await loadLegs(legs, now);
  const mult = combinedMultiplier(resolved);
  return {
    combinedMultiplier: Math.round(mult * 100) / 100,
    potentialPayout: payoutFor(stake, mult),
    legs: resolved.map((r) => ({
      marketId: r.market.id,
      player: r.market.player.webName,
      pick: r.pick,
      line: r.line,
      multiplier: r.multiplier,
    })),
  };
}

/** Place a slip: debit stake -> house and persist slip + legs in one tx. */
export async function placeSlip(
  userId: string,
  legs: LegRequest[],
  stake: bigint,
  now = new Date(),
) {
  if (stake <= 0n) throw new BetError("Stake must be positive");
  const resolved = await loadLegs(legs, now);
  const mult = combinedMultiplier(resolved);
  const potentialPayout = payoutFor(stake, mult);
  const accountId = await ensureCreditAccount(userId);

  return prisma.$transaction(async (tx) => {
    const house = await ensureHouse(tx);
    await transfer(tx, {
      fromAccountId: accountId,
      toAccountId: house,
      amount: stake,
      type: LedgerType.STAKE,
      refType: "BetSlip",
    });
    const slip = await tx.betSlip.create({
      data: {
        userId,
        stake,
        combinedMultiplier: mult,
        potentialPayout,
        legs: {
          create: resolved.map((r) => ({
            marketId: r.market.id,
            pick: r.pick,
            line: r.line,
            multiplier: r.multiplier,
          })),
        },
      },
      include: { legs: true },
    });
    return slip;
  });
}
