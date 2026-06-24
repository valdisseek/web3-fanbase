import { describe, it, expect } from "vitest";
import { buildMarketRows, type RawMarket, type FixtureForMapping } from "@/lib/marketRows";

const teamShort = { 11: "MUN", 12: "LIV", 13: "ARS" };

const market: RawMarket = {
  id: "m1", playerId: 9, webName: "Salah", teamId: 12, teamShort: "LIV",
  elementType: 3, line: 6.5, overMultiplier: 1.85, underMultiplier: 1.95, code: 118748,
};

const fixtures: FixtureForMapping[] = [
  { id: 100, teamHId: 11, teamAId: 12, started: false, finished: false },
];

describe("buildMarketRows", () => {
  it("resolves opponent, home/away, and fixture id", () => {
    const [row] = buildMarketRows([market], fixtures, teamShort);
    expect(row.opponent).toBe("MUN");
    expect(row.isHome).toBe(false);
    expect(row.fixtureId).toBe(100);
    expect(row.code).toBe(118748);
    expect(row.player).toBe("Salah");
  });

  it("marks home correctly", () => {
    const home = { ...market, teamId: 11, teamShort: "MUN" };
    const [row] = buildMarketRows([home], fixtures, teamShort);
    expect(row.isHome).toBe(true);
    expect(row.opponent).toBe("LIV");
  });

  it("returns null opponent/fixture when the team has no fixture (blank GW)", () => {
    const [row] = buildMarketRows([market], [], teamShort);
    expect(row.opponent).toBeNull();
    expect(row.fixtureId).toBeNull();
    expect(row.isHome).toBe(false);
  });
});
