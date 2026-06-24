import { describe, it, expect } from "vitest";
import {
  combinedMultiplier,
  payoutFor,
  resolveLeg,
  settleSlip,
} from "@/lib/engine/parlay";
import { LegPick, LegResult, SlipStatus } from "@/lib/constants";

describe("parlay", () => {
  it("multiplies leg multipliers", () => {
    expect(combinedMultiplier([{ multiplier: 2 }, { multiplier: 1.5 }])).toBeCloseTo(3);
  });

  it("floors payouts so rounding never favors the player", () => {
    expect(payoutFor(100n, 2.999)).toBe(299n);
  });

  it("resolves OVER/UNDER legs vs actual points", () => {
    expect(resolveLeg({ pick: LegPick.OVER, line: 6.5 }, 8)).toBe(LegResult.WON);
    expect(resolveLeg({ pick: LegPick.OVER, line: 6.5 }, 4)).toBe(LegResult.LOST);
    expect(resolveLeg({ pick: LegPick.UNDER, line: 6.5 }, 4)).toBe(LegResult.WON);
    expect(resolveLeg({ pick: LegPick.UNDER, line: 6.5 }, 8)).toBe(LegResult.LOST);
  });

  it("voids a leg with no result or a void market", () => {
    expect(resolveLeg({ pick: LegPick.OVER, line: 6.5 }, null)).toBe(LegResult.VOID);
    expect(resolveLeg({ pick: LegPick.OVER, line: 6.5 }, 8, true)).toBe(LegResult.VOID);
  });

  it("pushes on an exact whole-number line", () => {
    expect(resolveLeg({ pick: LegPick.OVER, line: 6 }, 6)).toBe(LegResult.PUSH);
  });

  it("loses the whole slip if any leg loses", () => {
    const r = settleSlip(100n, [
      { result: LegResult.WON, multiplier: 2 },
      { result: LegResult.LOST, multiplier: 3 },
    ]);
    expect(r.status).toBe(SlipStatus.LOST);
    expect(r.payout).toBe(0n);
  });

  it("pays product of WON legs; PUSH/VOID legs drop out", () => {
    const r = settleSlip(100n, [
      { result: LegResult.WON, multiplier: 2 },
      { result: LegResult.PUSH, multiplier: 3 },
      { result: LegResult.WON, multiplier: 1.5 },
    ]);
    expect(r.status).toBe(SlipStatus.WON);
    expect(r.payout).toBe(payoutFor(100n, 3)); // 2 * 1.5
  });

  it("refunds stake if every leg is PUSH/VOID", () => {
    const r = settleSlip(100n, [
      { result: LegResult.VOID, multiplier: 2 },
      { result: LegResult.PUSH, multiplier: 3 },
    ]);
    expect(r.status).toBe(SlipStatus.VOID);
    expect(r.payout).toBe(100n);
  });
});
