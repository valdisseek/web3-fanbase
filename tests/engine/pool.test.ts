import { describe, it, expect } from "vitest";
import { computePoolSettlement, type PoolEntryInput } from "@/lib/engine/pool";
import { PoolFormat } from "@/lib/constants";

function entries(scores: number[]): PoolEntryInput[] {
  return scores.map((s, i) => ({ id: `e${i}`, userId: `u${i}`, score: s }));
}

function sum(m: Map<string, bigint>): bigint {
  let t = 0n;
  for (const v of m.values()) t += v;
  return t;
}

describe("pool settlement", () => {
  it("voids and refunds when under minEntries", () => {
    const r = computePoolSettlement(entries([10, 20]), {
      entryFee: 100n,
      rakeBps: 1000,
      format: PoolFormat.GPP,
      minEntries: 5,
    });
    expect(r.voided).toBe(true);
    expect(r.rake).toBe(0n);
    expect(sum(r.payouts)).toBe(200n); // both refunded 100
  });

  it("GPP: sum(payouts) + rake === totalPot exactly", () => {
    const r = computePoolSettlement(entries([50, 40, 30, 20, 10, 5, 1, 0, 0, 0]), {
      entryFee: 100n,
      rakeBps: 1000,
      format: PoolFormat.GPP,
      minEntries: 2,
    });
    expect(r.voided).toBe(false);
    expect(r.totalPot).toBe(1000n);
    expect(sum(r.payouts) + r.rake).toBe(1000n);
    expect(r.rake).toBeGreaterThanOrEqual(100n); // >= 10% rake
  });

  it("DOUBLE_UP: top half paid, sum(payouts) + rake === totalPot", () => {
    const r = computePoolSettlement(entries([6, 5, 4, 3, 2, 1]), {
      entryFee: 100n,
      rakeBps: 1000,
      format: PoolFormat.DOUBLE_UP,
      minEntries: 2,
    });
    expect(r.totalPot).toBe(600n);
    expect(sum(r.payouts) + r.rake).toBe(600n);
    // 3 winners share netPrize 540 => 180 each
    const winners = [...r.payouts.values()].filter((v) => v > 0n);
    expect(winners.length).toBe(3);
    expect(winners.every((v) => v === 180n)).toBe(true);
  });

  it("splits tied scores evenly and conserves the pot", () => {
    const r = computePoolSettlement(entries([10, 10, 10, 1, 1]), {
      entryFee: 100n,
      rakeBps: 1000,
      format: PoolFormat.GPP,
      minEntries: 2,
    });
    expect(sum(r.payouts) + r.rake).toBe(500n);
    // the three tied leaders all share rank 1
    const r0 = r.ranks.get("e0");
    const r1 = r.ranks.get("e1");
    const r2 = r.ranks.get("e2");
    expect(r0).toBe(1);
    expect(r1).toBe(1);
    expect(r2).toBe(1);
  });
});
