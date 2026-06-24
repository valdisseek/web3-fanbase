import { describe, it, expect } from "vitest";
import { computeH2HSettlement } from "@/lib/engine/h2h";

describe("h2h settlement", () => {
  it("creator wins: prize = pot - rake, house keeps rake", () => {
    const r = computeH2HSettlement(100n, 1000, 60, 50);
    expect(r.outcome).toBe("CREATOR");
    expect(r.pot).toBe(200n);
    expect(r.rake).toBe(20n);
    expect(r.prize).toBe(180n);
    expect(r.prize + r.rake).toBe(r.pot);
  });

  it("opponent wins", () => {
    const r = computeH2HSettlement(100n, 1000, 40, 50);
    expect(r.outcome).toBe("OPPONENT");
    expect(r.prize).toBe(180n);
  });

  it("tie refunds each side the stake and takes no rake", () => {
    const r = computeH2HSettlement(100n, 1000, 50, 50);
    expect(r.outcome).toBe("TIE");
    expect(r.rake).toBe(0n);
    expect(r.prize).toBe(0n);
    expect(r.refundEach).toBe(100n);
  });
});
