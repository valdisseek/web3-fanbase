import { describe, it, expect } from "vitest";
import { snapLine, priceProp, overround, probOver } from "@/lib/engine/pricing";

describe("pricing", () => {
  it("snaps lines to the X.5 grid to avoid pushes", () => {
    expect(snapLine(6)).toBe(6.5);
    expect(snapLine(6.4)).toBe(6.5);
    expect(snapLine(6.7)).toBe(6.5);
    expect(snapLine(2.0)).toBe(2.5);
    expect(snapLine(2.3) % 1).toBe(0.5);
  });

  it("produces an overround > 1 (house edge) for any projection", () => {
    for (const mu of [0.5, 2, 4.5, 6, 8.2, 12]) {
      const price = priceProp(mu);
      expect(overround(price)).toBeGreaterThan(1);
    }
  });

  it("vig reduces both multipliers below fair odds", () => {
    const mu = 5;
    const noVig = priceProp(mu, 0);
    const withVig = priceProp(mu, 0.06);
    expect(withVig.overMultiplier).toBeLessThan(noVig.overMultiplier);
    expect(withVig.underMultiplier).toBeLessThan(noVig.underMultiplier);
  });

  it("higher projection raises P(over)", () => {
    expect(probOver(8, 5)).toBeGreaterThan(probOver(3, 5));
  });
});
