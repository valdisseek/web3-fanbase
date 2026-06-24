import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MyEntriesSheet } from "@/components/bets/MyEntriesSheet";

const slips = [
  { id: "s1", stake: 100, combinedMultiplier: 2, potentialPayout: 200, status: "PENDING", payout: null,
    legs: [{ player: "Salah", pick: "OVER", line: 6.5, multiplier: 2, result: "PENDING", resultPoints: null }] },
  { id: "s2", stake: 50, combinedMultiplier: 3, potentialPayout: 150, status: "WON", payout: 150,
    legs: [{ player: "Haaland", pick: "UNDER", line: 7.5, multiplier: 3, result: "WON", resultPoints: 4 }] },
];

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn(async () => ({
    ok: true,
    json: async () => ({ slips }),
  })) as unknown as typeof fetch);
});
afterEach(() => vi.unstubAllGlobals());

describe("MyEntriesSheet", () => {
  it("renders nothing when closed", () => {
    const { container } = render(<MyEntriesSheet open={false} onClose={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it("loads slips and filters to settled", async () => {
    render(<MyEntriesSheet open={true} onClose={() => {}} />);
    await waitFor(() => expect(screen.getByText("Salah OVER 6.5")).toBeTruthy());
    fireEvent.click(screen.getByRole("button", { name: "Settled" }));
    expect(screen.queryByText("Salah OVER 6.5")).toBeNull();
    expect(screen.getByText("Haaland UNDER 7.5")).toBeTruthy();
  });

  it("calls onClose from the close button", async () => {
    const onClose = vi.fn();
    render(<MyEntriesSheet open={true} onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: /close/i }));
    expect(onClose).toHaveBeenCalled();
  });
});
