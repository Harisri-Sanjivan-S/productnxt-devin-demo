import { describe, it, expect } from "vitest";
import { footerText } from "../src/todos";

describe("footerText", () => {
  it("shows the year of the given date", () => {
    expect(footerText(new Date("2026-11-24"))).toBe("To-Do demo · © 2026 Winter");
    expect(footerText(new Date("2031-01-01"))).toBe("To-Do demo · © 2031 Winter");
  });

  it("defaults to the current year", () => {
    expect(footerText()).toBe(`To-Do demo · © ${new Date().getFullYear()} Winter`);
  });
});
