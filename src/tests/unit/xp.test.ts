import { describe, it, expect } from "vitest";
import { xpForAction } from "@/lib/xp";

describe("xpForAction", () => {
  it("geeft 10 voor correcte quiz", () => {
    expect(xpForAction("quiz", true)).toBe(10);
  });

  it("geeft 0 voor foute quiz", () => {
    expect(xpForAction("quiz", false)).toBe(0);
  });

  it("geeft 5 voor poll", () => {
    expect(xpForAction("poll")).toBe(5);
  });

  it("geeft 3 voor fact", () => {
    expect(xpForAction("fact")).toBe(3);
  });
});
