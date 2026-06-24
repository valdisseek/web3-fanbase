import { PoolFormat } from "@/lib/constants";

export interface PoolEntryInput {
  id: string;
  userId: string;
  score: number;
}

export interface PoolSettlement {
  voided: boolean;
  totalPot: bigint;
  rake: bigint; // includes any undistributed remainder kept by the house
  /** entryId -> payout (winnings for non-void; refund for void) */
  payouts: Map<string, bigint>;
  /** entryId -> finishing rank (1-based, competition ranking) */
  ranks: Map<string, number>;
}

export interface PoolParams {
  entryFee: bigint;
  rakeBps: number;
  format: PoolFormat;
  minEntries: number;
  /** GPP: fraction of field paid (default 0.2). */
  payoutFraction?: number;
}

/**
 * Compute pool settlement. INVARIANT: when not voided,
 *   sum(payouts) + rake === totalPot   (exactly, integer credits).
 * When voided (entries < minEntries): every entry is refunded its entryFee,
 * rake is 0, payouts == refunds.
 */
export function computePoolSettlement(
  entries: PoolEntryInput[],
  params: PoolParams,
): PoolSettlement {
  const { entryFee, rakeBps, format, minEntries, payoutFraction = 0.2 } = params;
  const n = entries.length;
  const totalPot = entryFee * BigInt(n);
  const payouts = new Map<string, bigint>();
  const ranks = new Map<string, number>();

  if (n < minEntries) {
    for (const e of entries) payouts.set(e.id, entryFee);
    return { voided: true, totalPot, rake: 0n, payouts, ranks };
  }

  const rakeBase = (totalPot * BigInt(rakeBps)) / 10000n; // floor via BigInt div
  const netPrize = totalPot - rakeBase;

  // Sort by score desc; deterministic tiebreak by userId for stable grouping.
  const sorted = [...entries].sort(
    (a, b) => b.score - a.score || (a.userId < b.userId ? -1 : a.userId > b.userId ? 1 : 0),
  );

  // slotPrize[i] = prize for finishing in position i (0-based), pre-ties.
  const slotPrize = new Array<bigint>(n).fill(0n);
  let distributed = 0n;

  if (format === PoolFormat.DOUBLE_UP) {
    const numWinners = Math.floor(n / 2);
    if (numWinners > 0) {
      const perWinner = netPrize / BigInt(numWinners); // floor
      for (let i = 0; i < numWinners; i++) slotPrize[i] = perWinner;
      distributed = perWinner * BigInt(numWinners);
    }
    // remainder (netPrize - distributed) stays with the house.
  } else {
    // GPP: top fraction paid on a 1/rank curve, remainder folded into slot 0.
    const numPaid = Math.max(1, Math.ceil(n * payoutFraction));
    const weights: number[] = [];
    let sumW = 0;
    for (let i = 0; i < numPaid; i++) {
      const w = 1 / (i + 1);
      weights.push(w);
      sumW += w;
    }
    for (let i = 0; i < numPaid; i++) {
      slotPrize[i] = BigInt(Math.floor((Number(netPrize) * weights[i]) / sumW));
      distributed += slotPrize[i];
    }
    // fold rounding remainder into the winner so GPP distributes all of netPrize.
    slotPrize[0] += netPrize - distributed;
    distributed = netPrize;
  }

  const houseRemainder = netPrize - distributed; // 0 for GPP, >=0 for double-up
  const rake = rakeBase + houseRemainder;

  // Assign slots to entries, splitting ties evenly (remainder to lowest userId).
  let i = 0;
  while (i < n) {
    let j = i;
    while (j < n && sorted[j].score === sorted[i].score) j++;
    const group = sorted.slice(i, j);
    const groupPrize = slotPrize.slice(i, j).reduce((a, b) => a + b, 0n);
    const size = BigInt(group.length);
    const each = groupPrize / size; // floor
    let remainder = groupPrize - each * size;
    // deterministic remainder recipient(s): lowest userId first
    const byUser = [...group].sort((a, b) => (a.userId < b.userId ? -1 : 1));
    for (const e of group) {
      let amt = each;
      if (remainder > 0n && byUser[0].id === e.id) {
        amt += remainder;
        remainder = 0n;
      }
      payouts.set(e.id, amt);
      ranks.set(e.id, i + 1); // competition rank (1-based)
    }
    i = j;
  }

  return { voided: false, totalPot, rake, payouts, ranks };
}
