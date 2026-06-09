/**
 * Tests for utility functions in src/lib/utils.ts
 */
import { describe, it, expect } from "vitest";
import {
  formatDate,
  formatDateTime,
  statusColor,
  messageStatusColor,
  capitalize,
  scoreColor,
  truncate,
} from "../../src/lib/utils";

describe("Utility Functions", () => {
  describe("formatDate", () => {
    it("should format a valid date string", () => {
      const result = formatDate("2026-03-24T10:00:00Z");
      expect(result).toContain("Mar");
      expect(result).toContain("24");
      expect(result).toContain("2026");
    });

    it("should return dash for null", () => {
      expect(formatDate(null)).toBe("—");
    });

    it("should return dash for undefined", () => {
      expect(formatDate(undefined)).toBe("—");
    });

    it("should return dash for empty string", () => {
      expect(formatDate("")).toBe("—");
    });
  });

  describe("formatDateTime", () => {
    it("should format a valid datetime string", () => {
      const result = formatDateTime("2026-03-24T10:30:00Z");
      expect(result).toContain("Mar");
      expect(result).toContain("24");
    });

    it("should return dash for null", () => {
      expect(formatDateTime(null)).toBe("—");
    });

    it("should return dash for undefined", () => {
      expect(formatDateTime(undefined)).toBe("—");
    });
  });

  describe("statusColor", () => {
    it("should return correct color for new", () => {
      expect(statusColor("new")).toContain("blue");
    });

    it("should return correct color for contacted", () => {
      expect(statusColor("contacted")).toContain("yellow");
    });

    it("should return correct color for replied", () => {
      expect(statusColor("replied")).toContain("green");
    });

    it("should return correct color for booked", () => {
      expect(statusColor("booked")).toContain("purple");
    });

    it("should return correct color for closed", () => {
      expect(statusColor("closed")).toContain("emerald");
    });

    it("should return correct color for nurture", () => {
      expect(statusColor("nurture")).toContain("orange");
    });

    it("should return correct color for lost", () => {
      expect(statusColor("lost")).toContain("red");
    });

    it("should return gray for unknown status", () => {
      expect(statusColor("unknown")).toContain("gray");
    });
  });

  describe("messageStatusColor", () => {
    it("should return correct color for draft", () => {
      expect(messageStatusColor("draft")).toContain("gray");
    });

    it("should return correct color for queued", () => {
      expect(messageStatusColor("queued")).toContain("blue");
    });

    it("should return correct color for sent", () => {
      expect(messageStatusColor("sent")).toContain("green");
    });

    it("should return correct color for replied", () => {
      expect(messageStatusColor("replied")).toContain("purple");
    });

    it("should return correct color for archived", () => {
      expect(messageStatusColor("archived")).toContain("slate");
    });

    it("should return gray for unknown status", () => {
      expect(messageStatusColor("unknown")).toContain("gray");
    });
  });

  describe("capitalize", () => {
    it("should capitalize first letter", () => {
      expect(capitalize("hello")).toBe("Hello");
    });

    it("should handle single character", () => {
      expect(capitalize("a")).toBe("A");
    });

    it("should handle already capitalized", () => {
      expect(capitalize("Hello")).toBe("Hello");
    });

    it("should handle empty string", () => {
      expect(capitalize("")).toBe("");
    });
  });

  describe("scoreColor", () => {
    it("should return green for high scores (>=70)", () => {
      expect(scoreColor(70)).toContain("green");
      expect(scoreColor(85)).toContain("green");
      expect(scoreColor(100)).toContain("green");
    });

    it("should return yellow for medium scores (40-69)", () => {
      expect(scoreColor(40)).toContain("yellow");
      expect(scoreColor(55)).toContain("yellow");
      expect(scoreColor(69)).toContain("yellow");
    });

    it("should return red for low scores (<40)", () => {
      expect(scoreColor(0)).toContain("red");
      expect(scoreColor(20)).toContain("red");
      expect(scoreColor(39)).toContain("red");
    });

    it("should return gray for null", () => {
      expect(scoreColor(null)).toContain("gray");
    });
  });

  describe("truncate", () => {
    it("should not truncate short strings", () => {
      expect(truncate("hello", 80)).toBe("hello");
    });

    it("should truncate long strings with ellipsis", () => {
      const long = "a".repeat(100);
      const result = truncate(long, 80);
      expect(result.length).toBe(83); // 80 + "..."
      expect(result.endsWith("...")).toBe(true);
    });

    it("should use default maxLen of 80", () => {
      const short = "a".repeat(50);
      expect(truncate(short)).toBe(short);

      const long = "a".repeat(100);
      expect(truncate(long)).toHaveLength(83);
    });

    it("should handle string at exact boundary", () => {
      const exact = "a".repeat(80);
      expect(truncate(exact, 80)).toBe(exact);
    });
  });
});
