import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BetTabs } from "@/components/bets/BetTabs";

describe("BetTabs", () => {
  it("renders the three tabs and reports changes", () => {
    const onChange = vi.fn();
    render(<BetTabs active="popular" onChange={onChange} query="" onQuery={() => {}} />);
    expect(screen.getByRole("button", { name: "Popular" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "All Players" }));
    expect(onChange).toHaveBeenCalledWith("all");
  });

  it("reports search query changes", () => {
    const onQuery = vi.fn();
    render(<BetTabs active="all" onChange={() => {}} query="" onQuery={onQuery} />);
    fireEvent.change(screen.getByPlaceholderText("Search players"), {
      target: { value: "sal" },
    });
    expect(onQuery).toHaveBeenCalledWith("sal");
  });
});
