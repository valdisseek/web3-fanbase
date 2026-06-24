export type H2HOutcome = "CREATOR" | "OPPONENT" | "TIE";

export interface H2HSettlement {
  outcome: H2HOutcome;
  pot: bigint;
  rake: bigint; // 0 on a tie (house only earns on a decided result)
  /** Winner's payout (0 on a tie). */
  prize: bigint;
  /** On a tie, the stake refunded to EACH side. */
  refundEach: bigint;
}

/**
 * Settle a H2H. Both sides staked `stake`; pot = 2*stake. On a decided result
 * the winner receives pot - rake and the house keeps rake. On a tie, each side
 * is refunded its stake and the house takes nothing.
 */
export function computeH2HSettlement(
  stake: bigint,
  rakeBps: number,
  creatorScore: number,
  opponentScore: number,
): H2HSettlement {
  const pot = stake * 2n;

  if (creatorScore === opponentScore) {
    return { outcome: "TIE", pot, rake: 0n, prize: 0n, refundEach: stake };
  }

  const rake = (pot * BigInt(rakeBps)) / 10000n; // floor
  const prize = pot - rake;
  const outcome: H2HOutcome = creatorScore > opponentScore ? "CREATOR" : "OPPONENT";
  return { outcome, pot, rake, prize, refundEach: 0n };
}
