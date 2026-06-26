import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BetsHeader } from "@/components/bets/BetsHeader";

// BalancePill fetches /api/wallet on mount; stub it.
beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn(async () => ({
    ok: true,
    json: async () => ({ balance: 25500 }),
  })) as unknown as typeof fetch);
});
afterEach(() => vi.unstubAllGlobals());

describe("BetsHeader", () => {
  it("renders the brand and a wallet (+) link", () => {
    render(<BetsHeader onOpenEntries={() => {}} />);
    expect(screen.getByText("base")).toBeTruthy();
    const plus = screen.getByRole("link", { name: /add funds/i }) as HTMLAnchorElement;
    expect(plus.getAttribute("href")).toBe("/wallet");
  });

  it("opens entries from the ticket button", () => {
    const onOpenEntries = vi.fn();
    render(<BetsHeader onOpenEntries={onOpenEntries} />);
    fireEvent.click(screen.getByRole("button", { name: /my entries/i }));
    expect(onOpenEntries).toHaveBeenCalled();
  });
});
