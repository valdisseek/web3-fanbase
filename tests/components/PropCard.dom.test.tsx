import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PropCard } from "@/components/bets/PropCard";
import type { MarketRow } from "@/lib/marketRows";

const market: MarketRow = {
  id: "m1", playerId: 9, player: "Salah", team: "LIV", code: 118748, teamId: 12,
  position: 3, line: 6.5, overMultiplier: 1.85, underMultiplier: 1.95,
  opponent: "MUN", isHome: false, fixtureId: 100,
};

describe("PropCard", () => {
  it("renders player, match label, line, and both multipliers", () => {
    render(<PropCard market={market} gwName="GW1" selected={null} onPick={() => {}} />);
    expect(screen.getByText("Salah")).toBeTruthy();
    expect(screen.getByText(/MUN vs LIV/)).toBeTruthy();
    expect(screen.getByText(/GW1/)).toBeTruthy();
    expect(screen.getByText("1.85×")).toBeTruthy();
    expect(screen.getByText("1.95×")).toBeTruthy();
  });

  it("calls onPick with OVER when the over button is clicked", () => {
    const onPick = vi.fn();
    render(<PropCard market={market} gwName="GW1" selected={null} onPick={onPick} />);
    fireEvent.click(screen.getByRole("button", { name: /Over 6.5/ }));
    expect(onPick).toHaveBeenCalledWith(market, "OVER");
  });

  it("marks the selected side as pressed", () => {
    render(<PropCard market={market} gwName="GW1" selected="UNDER" onPick={() => {}} />);
    expect(screen.getByRole("button", { name: /Under 6.5/ }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("button", { name: /Over 6.5/ }).getAttribute("aria-pressed")).toBe("false");
  });
});
