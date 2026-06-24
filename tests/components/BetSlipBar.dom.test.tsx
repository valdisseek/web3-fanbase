import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BetSlipBar, type Leg } from "@/components/bets/BetSlipBar";

const legs: Leg[] = [
  { marketId: "m1", player: "Salah", line: 6.5, pick: "OVER", multiplier: 2 },
  { marketId: "m2", player: "Haaland", line: 7.5, pick: "UNDER", multiplier: 1.85 },
];

describe("BetSlipBar", () => {
  it("renders nothing when there are no legs", () => {
    const { container } = render(
      <BetSlipBar legs={[]} stake={100} busy={false} message={null}
        onStake={() => {}} onRemove={() => {}} onPlace={() => {}} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("shows leg count, combined multiplier, and potential payout", () => {
    render(
      <BetSlipBar legs={legs} stake={100} busy={false} message={null}
        onStake={() => {}} onRemove={() => {}} onPlace={() => {}} />,
    );
    expect(screen.getByText(/2 legs/)).toBeTruthy();
    expect(screen.getByText("×3.70")).toBeTruthy();        // 2 * 1.85
    expect(screen.getByText(/win 370/)).toBeTruthy();      // floor(100 * 3.70)
  });

  it("fires onPlace when the place button is clicked", () => {
    const onPlace = vi.fn();
    render(
      <BetSlipBar legs={legs} stake={100} busy={false} message={null}
        onStake={() => {}} onRemove={() => {}} onPlace={onPlace} />,
    );
    fireEvent.click(screen.getByRole("button", { name: /Place/ }));
    expect(onPlace).toHaveBeenCalled();
  });
});
