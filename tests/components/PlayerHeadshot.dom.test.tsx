import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PlayerHeadshot, initials } from "@/components/bets/PlayerHeadshot";

describe("initials", () => {
  it("takes first + last initial", () => {
    expect(initials("M. Salah")).toBe("MS");
    expect(initials("Bukayo Saka")).toBe("BS");
  });
  it("uses first two letters for a single word", () => {
    expect(initials("Salah")).toBe("SA");
  });
});

describe("PlayerHeadshot", () => {
  it("renders the FPL photo when code is present", () => {
    render(<PlayerHeadshot code={118748} name="M. Salah" />);
    const img = screen.getByAltText("M. Salah") as HTMLImageElement;
    expect(img.src).toContain("p118748.png");
  });

  it("shows initials when code is null", () => {
    render(<PlayerHeadshot code={null} name="M. Salah" />);
    expect(screen.getByText("MS")).toBeTruthy();
  });

  it("falls back to initials when the image errors", () => {
    render(<PlayerHeadshot code={999} name="M. Salah" />);
    fireEvent.error(screen.getByAltText("M. Salah"));
    expect(screen.getByText("MS")).toBeTruthy();
  });
});
