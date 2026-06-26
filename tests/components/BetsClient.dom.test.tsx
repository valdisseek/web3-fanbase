import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BetsClient } from "@/components/bets/BetsClient";
import type { MarketRow } from "@/lib/marketRows";

const markets: MarketRow[] = [
  { id: "m1", playerId: 9, player: "Salah", team: "LIV", code: 118748, teamId: 12,
    position: 3, line: 6.5, overMultiplier: 1.85, underMultiplier: 1.95,
    opponent: "MUN", isHome: false, fixtureId: 100 },
  { id: "m2", playerId: 1, player: "Haaland", team: "CITY", code: 223094, teamId: 14,
    position: 4, line: 7.5, overMultiplier: 1.80, underMultiplier: 2.00,
    opponent: "ARS", isHome: true, fixtureId: 101 },
];

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn(async (url: string) => {
    if (String(url).includes("/api/markets")) {
      return { ok: true, json: async () => ({ gameweekId: 1, markets }) };
    }
    return { ok: true, json: async () => ({}) };
  }) as unknown as typeof fetch);
});
afterEach(() => vi.unstubAllGlobals());

const chips = [
  { id: 100, label: "MUN vs LIV", live: false },
  { id: 101, label: "CITY vs ARS", live: false },
];

describe("BetsClient", () => {
  it("loads markets and renders prop cards", async () => {
    render(<BetsClient gwName="GW1" fixtures={chips} hasGameweek={true} />);
    await waitFor(() => expect(screen.getByText("Salah")).toBeTruthy());
    expect(screen.getByText("Haaland")).toBeTruthy();
  });

  it("adds a pick to the bet slip", async () => {
    render(<BetsClient gwName="GW1" fixtures={chips} hasGameweek={true} />);
    await waitFor(() => expect(screen.getByText("Salah")).toBeTruthy());
    fireEvent.click(screen.getAllByRole("button", { name: /Over 6.5/ })[0]);
    expect(screen.getByText(/1 leg/)).toBeTruthy();
  });
});
