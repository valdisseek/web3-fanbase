import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { BottomNav } from "@/components/shell/BottomNav";

beforeEach(() => {
  vi.mock("next/navigation", () => ({ usePathname: () => "/bets" }));
});

describe("BottomNav", () => {
  it("labels the first tab 'Bets' linking to /bets", () => {
    render(<BottomNav />);
    const link = screen.getByRole("link", { name: /Bets/ }) as HTMLAnchorElement;
    expect(link.getAttribute("href")).toBe("/bets");
  });
});
