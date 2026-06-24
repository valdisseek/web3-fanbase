import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FixtureChips } from "@/components/bets/FixtureChips";

const chips = [
  { id: 100, label: "MUN vs LIV", live: true },
  { id: 101, label: "CITY vs ARS", live: false },
];

describe("FixtureChips", () => {
  it("renders an All chip plus one per fixture and a LIVE marker", () => {
    render(<FixtureChips fixtures={chips} activeFixtureId={null} onSelect={() => {}} />);
    expect(screen.getByRole("button", { name: "All" })).toBeTruthy();
    expect(screen.getByText("MUN vs LIV")).toBeTruthy();
    expect(screen.getByText("LIVE")).toBeTruthy();
  });

  it("selects a fixture and clears via All", () => {
    const onSelect = vi.fn();
    render(<FixtureChips fixtures={chips} activeFixtureId={100} onSelect={onSelect} />);
    fireEvent.click(screen.getByText("CITY vs ARS"));
    expect(onSelect).toHaveBeenCalledWith(101);
    fireEvent.click(screen.getByRole("button", { name: "All" }));
    expect(onSelect).toHaveBeenCalledWith(null);
  });
});
