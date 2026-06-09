import { describe, it, expect } from "vitest";
import {
  canTransition,
  getValidNextStatuses,
  mapOutcomeToStatus,
  validateStatus,
} from "../../src/lib/lead-status";

describe("Lead Status FSM", () => {
  describe("canTransition", () => {
    // Valid transitions
    it("should allow new → contacted", () => {
      expect(canTransition("new", "contacted")).toBe(true);
    });

    it("should allow contacted → replied", () => {
      expect(canTransition("contacted", "replied")).toBe(true);
    });

    it("should allow contacted → nurture", () => {
      expect(canTransition("contacted", "nurture")).toBe(true);
    });

    it("should allow contacted → lost", () => {
      expect(canTransition("contacted", "lost")).toBe(true);
    });

    it("should allow replied → booked", () => {
      expect(canTransition("replied", "booked")).toBe(true);
    });

    it("should allow replied → nurture", () => {
      expect(canTransition("replied", "nurture")).toBe(true);
    });

    it("should allow booked → closed", () => {
      expect(canTransition("booked", "closed")).toBe(true);
    });

    it("should allow booked → lost", () => {
      expect(canTransition("booked", "lost")).toBe(true);
    });

    it("should allow nurture → contacted (re-engage)", () => {
      expect(canTransition("nurture", "contacted")).toBe(true);
    });

    it("should allow lost → contacted (re-engage)", () => {
      expect(canTransition("lost", "contacted")).toBe(true);
    });

    // Invalid transitions
    it("should NOT allow new → booked (skip steps)", () => {
      expect(canTransition("new", "booked")).toBe(false);
    });

    it("should NOT allow new → closed", () => {
      expect(canTransition("new", "closed")).toBe(false);
    });

    it("should NOT allow closed → anything", () => {
      expect(canTransition("closed", "new")).toBe(false);
      expect(canTransition("closed", "contacted")).toBe(false);
      expect(canTransition("closed", "replied")).toBe(false);
    });

    it("should NOT allow contacted → booked (skip replied)", () => {
      expect(canTransition("contacted", "booked")).toBe(false);
    });

    it("should NOT allow backwards new → new", () => {
      expect(canTransition("new", "new")).toBe(false);
    });
  });

  describe("getValidNextStatuses", () => {
    it("should return [contacted] for new", () => {
      expect(getValidNextStatuses("new")).toEqual(["contacted"]);
    });

    it("should return [replied, nurture, lost] for contacted", () => {
      expect(getValidNextStatuses("contacted")).toEqual([
        "replied",
        "nurture",
        "lost",
      ]);
    });

    it("should return [booked, nurture, lost] for replied", () => {
      expect(getValidNextStatuses("replied")).toEqual([
        "booked",
        "nurture",
        "lost",
      ]);
    });

    it("should return [closed, lost] for booked", () => {
      expect(getValidNextStatuses("booked")).toEqual(["closed", "lost"]);
    });

    it("should return [] for closed (terminal)", () => {
      expect(getValidNextStatuses("closed")).toEqual([]);
    });

    it("should return [contacted, lost] for nurture", () => {
      expect(getValidNextStatuses("nurture")).toEqual(["contacted", "lost"]);
    });

    it("should return [contacted] for lost", () => {
      expect(getValidNextStatuses("lost")).toEqual(["contacted"]);
    });
  });

  describe("mapOutcomeToStatus", () => {
    it("should map replied → replied", () => {
      expect(mapOutcomeToStatus("replied")).toBe("replied");
    });

    it("should map booked → booked", () => {
      expect(mapOutcomeToStatus("booked")).toBe("booked");
    });

    it("should map closed → closed", () => {
      expect(mapOutcomeToStatus("closed")).toBe("closed");
    });

    it("should map not_now → nurture", () => {
      expect(mapOutcomeToStatus("not_now")).toBe("nurture");
    });

    it("should map ignored → contacted", () => {
      expect(mapOutcomeToStatus("ignored")).toBe("contacted");
    });

    it("should return undefined for unknown outcome", () => {
      expect(mapOutcomeToStatus("unknown_outcome")).toBeUndefined();
    });
  });

  describe("validateStatus", () => {
    it("should validate all known statuses", () => {
      expect(validateStatus("new")).toBe(true);
      expect(validateStatus("contacted")).toBe(true);
      expect(validateStatus("replied")).toBe(true);
      expect(validateStatus("booked")).toBe(true);
      expect(validateStatus("closed")).toBe(true);
      expect(validateStatus("nurture")).toBe(true);
      expect(validateStatus("lost")).toBe(true);
    });

    it("should reject invalid statuses", () => {
      expect(validateStatus("invalid")).toBe(false);
      expect(validateStatus("")).toBe(false);
      expect(validateStatus("NEW")).toBe(false);
    });
  });
});
