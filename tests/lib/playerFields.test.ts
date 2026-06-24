import { describe, it, expect } from "vitest";
import { playerUpsertFields } from "@/lib/fpl/sync";
import type { FplElement } from "@/lib/fpl/types";

const el: FplElement = {
  id: 9, code: 118748, web_name: "Salah", first_name: "Mohamed",
  second_name: "Salah", team: 12, element_type: 3, now_cost: 130,
  total_points: 200, form: "7.5", ep_next: "6.2", status: "a",
};

describe("playerUpsertFields", () => {
  it("maps the FPL photo code through", () => {
    expect(playerUpsertFields(el).code).toBe(118748);
  });
  it("parses numeric strings", () => {
    const f = playerUpsertFields(el);
    expect(f.form).toBe(7.5);
    expect(f.epNext).toBe(6.2);
    expect(f.webName).toBe("Salah");
  });
});
