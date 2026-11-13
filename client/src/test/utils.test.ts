import { describe, it, expect } from "vitest";
import { getSuitabilityBadge, formatDate } from "../lib/utils.js";
import { translations, SUPPORTED_LANGUAGES } from "../lib/i18n.js";

describe("AgriSage Client Utilities", () => {
  it("getSuitabilityBadge should return Highly Suitable for score >= 80", () => {
    const badge = getSuitabilityBadge(92);
    expect(badge.label).toBe("Highly Suitable");
    expect(badge.color).toContain("emerald");
  });

  it("getSuitabilityBadge should return Moderately Suitable for score between 60 and 79", () => {
    const badge = getSuitabilityBadge(70);
    expect(badge.label).toBe("Moderately Suitable");
    expect(badge.color).toContain("green");
  });

  it("getSuitabilityBadge should return Fair / Conditional for score between 40 and 59", () => {
    const badge = getSuitabilityBadge(45);
    expect(badge.label).toBe("Fair / Conditional");
    expect(badge.color).toContain("amber");
  });

  it("getSuitabilityBadge should return Low Suitability for score below 40", () => {
    const badge = getSuitabilityBadge(20);
    expect(badge.label).toBe("Low Suitability");
    expect(badge.color).toContain("rose");
  });

  it("formatDate should format valid ISO date strings", () => {
    const formatted = formatDate("2026-11-13T10:00:00Z");
    expect(formatted).toBeTruthy();
    expect(formatted).toContain("2026");
  });

  it("translations dictionary includes English, Kannada, and Hindi with core navigation labels", () => {
    expect(SUPPORTED_LANGUAGES.map((l) => l.code)).toEqual(["en", "kn", "hi"]);
    expect(translations.en.appTitle).toBe("AgriSage AI");
    expect(translations.kn.appTitle).toBe("ಅಗ್ರಿಸೇಜ್ AI");
    expect(translations.hi.appTitle).toBe("एग्रीसेज AI");
  });
});
