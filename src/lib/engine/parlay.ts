import { LegPick, LegResult, SlipStatus } from "@/lib/constants";

export interface LegInput {
  pick: LegPick;
  line: number;
  multiplier: number;
}

/** floor(stake * multiplier) as BigInt — rounding never favors the player. */
export function payoutFor(stake: bigint, multiplier: number): bigint {
  return BigInt(Math.floor(Number(stake) * multiplier));
}

export function combinedMultiplier(legs: { multiplier: number }[]): number {
  return legs.reduce((m, l) => m * l.multiplier, 1);
}

/**
 * Resolve a single leg against the player's actual points for the gameweek.
 * Lines are on the X.5 grid so PUSH does not normally occur, but it is handled
 * for completeness (whole-number line + exact points). A voided market voids
 * the leg.
 */
export function resolveLeg(
  leg: { pick: LegPick; line: number },
  actualPoints: number | null,
  marketVoid = false,
): LegResult {
  if (marketVoid || actualPoints === null) return LegResult.VOID;
  if (actualPoints === leg.line) return LegResult.PUSH;
  const over = actualPoints > leg.line;
  const won = leg.pick === LegPick.OVER ? over : !over;
  return won ? LegResult.WON : LegResult.LOST;
}

export interface SettledSlip {
  status: SlipStatus;
  payout: bigint;
}

/**
 * Settle a slip given each leg's result + multiplier. Any LOST leg loses the
 * whole slip. PUSH/VOID legs drop out (multiplier 1.0). If every leg is
 * PUSH/VOID the slip is VOID and the stake is returned.
 */
export function settleSlip(
  stake: bigint,
  legs: { result: LegResult; multiplier: number }[],
): SettledSlip {
  if (legs.some((l) => l.result === LegResult.LOST)) {
    return { status: SlipStatus.LOST, payout: 0n };
  }
  const live = legs.filter((l) => l.result === LegResult.WON);
  if (live.length === 0) {
    // all PUSH/VOID -> refund stake
    return { status: SlipStatus.VOID, payout: stake };
  }
  const mult = live.reduce((m, l) => m * l.multiplier, 1);
  return { status: SlipStatus.WON, payout: payoutFor(stake, mult) };
}
