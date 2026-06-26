import { describe, it, expect } from "vitest";
import { buildFixtureChips, type FixtureForChips } from "@/lib/betsView";

const teamShort = { 11: "MUN", 12: "LIV", 13: "ARS", 14: "CITY" };
const fixtures: FixtureForChips[] = [
  { id: 100, teamHId: 11, teamAId: 12, started: true, finished: false },
  { id: 101, teamHId: 14, teamAId: 13, started: false, finished: false },
];

describe("buildFixtureChips", () => {
  it("labels home vs away and flags live fixtures", () => {
    const chips = buildFixtureChips(fixtures, teamShort);
    expect(chips[0]).toEqual({ id: 100, label: "MUN vs LIV", live: true });
    expect(chips[1]).toEqual({ id: 101, label: "CITY vs ARS", live: false });
  });
  it("is not live once finished", () => {
    const done = [{ ...fixtures[0], started: true, finished: true }];
    expect(buildFixtureChips(done, teamShort)[0].live).toBe(false);
  });
});
