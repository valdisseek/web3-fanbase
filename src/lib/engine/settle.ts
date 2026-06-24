import { prisma } from "@/lib/db";
import { transfer } from "@/lib/engine/money";
import { ensureHouse } from "@/lib/house";
import { resolveLeg, settleSlip } from "@/lib/engine/parlay";
import { computePoolSettlement, type PoolEntryInput } from "@/lib/engine/pool";
import { computeH2HSettlement } from "@/lib/engine/h2h";
import {
  MarketStatus,
  SlipStatus,
  PoolStatus,
  H2HStatus,
  LedgerType,
  type LegPick,
  type LegResult,
} from "@/lib/constants";

function parseLineup(json: string | null): number[] {
  if (!json) return [];
  try {
    const v = JSON.parse(json);
    return Array.isArray(v) ? v.map(Number).filter((n) => Number.isFinite(n)) : [];
  } catch {
    return [];
  }
}

/**
 * Settle every product tied to a finalized gameweek. Gated on dataChecked.
 * Idempotent: re-running is a no-op (status guards + ledger idempotency keys).
 */
export async function settleGameweek(gameweekId: number) {
  const gw = await prisma.gameweek.findUnique({ where: { id: gameweekId } });
  if (!gw) throw new Error(`Gameweek ${gameweekId} not found`);
  if (!gw.dataChecked) {
    return { skipped: true, reason: "gameweek not finalized (dataChecked=false)" };
  }

  const stats = await prisma.playerGameweekStat.findMany({ where: { gameweekId } });
  const points = new Map<number, number>();
  for (const s of stats) points.set(s.playerId, s.totalPoints);
  const pts = (playerId: number) => points.get(playerId) ?? 0;

  const markets = await settleMarkets(gameweekId, points);
  const slips = await settleSlips(gameweekId);
  const pools = await settlePools(gameweekId, pts);
  const h2h = await settleH2H(gameweekId, pts);

  return { skipped: false, markets, slips, pools, h2h };
}

async function settleMarkets(gameweekId: number, points: Map<number, number>) {
  const markets = await prisma.propMarket.findMany({
    where: { gameweekId, status: { in: [MarketStatus.OPEN, MarketStatus.LOCKED] } },
  });
  let settled = 0;
  for (const m of markets) {
    const result = points.has(m.playerId) ? points.get(m.playerId)! : null;
    await prisma.$transaction(async (tx) => {
      await tx.propMarket.update({
        where: { id: m.id },
        data: {
          status: result === null ? MarketStatus.VOID : MarketStatus.SETTLED,
          resultPoints: result,
        },
      });
      const legs = await tx.betLeg.findMany({ where: { marketId: m.id } });
      for (const leg of legs) {
        const r = resolveLeg(
          { pick: leg.pick as LegPick, line: leg.line },
          result,
          result === null,
        );
        await tx.betLeg.update({ where: { id: leg.id }, data: { result: r } });
      }
    });
    settled++;
  }
  return { settled };
}

async function settleSlips(gameweekId: number) {
  // Slips whose legs reference markets in this gameweek.
  const slips = await prisma.betSlip.findMany({
    where: {
      status: SlipStatus.PENDING,
      legs: { some: { market: { gameweekId } } },
    },
    include: { legs: { include: { market: true } } },
  });
  let won = 0,
    lost = 0,
    voided = 0;
  for (const slip of slips) {
    // Only settle once all legs' markets are settled/void.
    const allResolved = slip.legs.every(
      (l) =>
        l.market.status === MarketStatus.SETTLED ||
        l.market.status === MarketStatus.VOID,
    );
    if (!allResolved) continue;

    const outcome = settleSlip(
      slip.stake,
      slip.legs.map((l) => ({ result: l.result as LegResult, multiplier: l.multiplier })),
    );

    await prisma.$transaction(async (tx) => {
      const house = await ensureHouse(tx);
      if (outcome.payout > 0n) {
        const acct = await tx.creditAccount.findUniqueOrThrow({
          where: { userId: slip.userId },
        });
        await transfer(tx, {
          fromAccountId: house,
          toAccountId: acct.id,
          amount: outcome.payout,
          type: outcome.status === SlipStatus.VOID ? LedgerType.REFUND : LedgerType.PAYOUT,
          refType: "BetSlip",
          refId: slip.id,
          idempotencyKey: `slip:${slip.id}:settle`,
        });
      }
      await tx.betSlip.update({
        where: { id: slip.id },
        data: { status: outcome.status, payout: outcome.payout },
      });
    });

    if (outcome.status === SlipStatus.WON) won++;
    else if (outcome.status === SlipStatus.LOST) lost++;
    else voided++;
  }
  return { won, lost, voided };
}

async function settlePools(gameweekId: number, pts: (id: number) => number) {
  const pools = await prisma.pool.findMany({
    where: { gameweekId, status: { in: [PoolStatus.OPEN, PoolStatus.LOCKED] } },
    include: { entries: true },
  });
  let settled = 0;
  for (const pool of pools) {
    const entryInputs: PoolEntryInput[] = pool.entries.map((e) => ({
      id: e.id,
      userId: e.userId,
      score: parseLineup(e.lineup).reduce((sum, pid) => sum + pts(pid), 0),
    }));
    const result = computePoolSettlement(entryInputs, {
      entryFee: pool.entryFee,
      rakeBps: pool.rakeBps,
      format: pool.format as "GPP" | "DOUBLE_UP",
      minEntries: pool.minEntries,
    });

    await prisma.$transaction(async (tx) => {
      const house = await ensureHouse(tx);
      for (const e of pool.entries) {
        const payout = result.payouts.get(e.id) ?? 0n;
        const score = entryInputs.find((x) => x.id === e.id)?.score ?? 0;
        const rank = result.ranks.get(e.id) ?? null;
        if (payout > 0n) {
          const acct = await tx.creditAccount.findUniqueOrThrow({
            where: { userId: e.userId },
          });
          await transfer(tx, {
            fromAccountId: house,
            toAccountId: acct.id,
            amount: payout,
            type: result.voided ? LedgerType.REFUND : LedgerType.PAYOUT,
            refType: "PoolEntry",
            refId: e.id,
            idempotencyKey: `poolentry:${e.id}:settle`,
          });
        }
        await tx.poolEntry.update({
          where: { id: e.id },
          data: { score, rank, payout },
        });
      }
      await tx.pool.update({
        where: { id: pool.id },
        data: { status: result.voided ? PoolStatus.VOID : PoolStatus.SETTLED },
      });
    });
    settled++;
  }
  return { settled };
}

async function settleH2H(gameweekId: number, pts: (id: number) => number) {
  const challenges = await prisma.h2HChallenge.findMany({
    where: {
      gameweekId,
      status: { in: [H2HStatus.ACCEPTED, H2HStatus.LOCKED] },
      opponentId: { not: null },
    },
  });
  let settled = 0;
  for (const c of challenges) {
    const creatorScore = parseLineup(c.creatorLineup).reduce((s, p) => s + pts(p), 0);
    const opponentScore = parseLineup(c.opponentLineup).reduce((s, p) => s + pts(p), 0);
    const r = computeH2HSettlement(c.stake, 1000, creatorScore, opponentScore);

    await prisma.$transaction(async (tx) => {
      const house = await ensureHouse(tx);
      if (r.outcome === "TIE") {
        for (const uid of [c.creatorId, c.opponentId!]) {
          const acct = await tx.creditAccount.findUniqueOrThrow({ where: { userId: uid } });
          await transfer(tx, {
            fromAccountId: house,
            toAccountId: acct.id,
            amount: r.refundEach,
            type: LedgerType.REFUND,
            refType: "H2HChallenge",
            refId: c.id,
            idempotencyKey: `h2h:${c.id}:refund:${uid}`,
          });
        }
        await tx.h2HChallenge.update({
          where: { id: c.id },
          data: { status: H2HStatus.SETTLED, winnerId: null },
        });
      } else {
        const winnerId = r.outcome === "CREATOR" ? c.creatorId : c.opponentId!;
        const acct = await tx.creditAccount.findUniqueOrThrow({ where: { userId: winnerId } });
        await transfer(tx, {
          fromAccountId: house,
          toAccountId: acct.id,
          amount: r.prize,
          type: LedgerType.PAYOUT,
          refType: "H2HChallenge",
          refId: c.id,
          idempotencyKey: `h2h:${c.id}:settle`,
        });
        await tx.h2HChallenge.update({
          where: { id: c.id },
          data: { status: H2HStatus.SETTLED, winnerId },
        });
      }
    });
    settled++;
  }
  return { settled };
}
