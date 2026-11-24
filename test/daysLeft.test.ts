import { describe, it, expect } from "vitest";
import { daysLeft } from "../src/todos";

describe("daysLeft", () => {
  it("does not count the current day (DXP-003)", () => {
    expect(daysLeft("2026-11-26", new Date("2026-11-24"))).toBe(1);
  });

  it("does not count the current day when viewed mid-day", () => {
    expect(daysLeft("2026-11-12", new Date("2026-11-06T12:00:00Z"))).toBe(5);
  });

  it("is consistent across times within the same day", () => {
    const due = "2026-11-26";
    expect(daysLeft(due, new Date("2026-11-24T00:00:00Z"))).toBe(1);
    expect(daysLeft(due, new Date("2026-11-24T23:59:00Z"))).toBe(1);
  });
});
