import { describe, it, expect } from "vitest";
import {
  normalizeHeader,
  validateRow,
  parseCsvRows,
} from "../../src/lib/csv-import";

describe("CSV Import", () => {
  describe("normalizeHeader", () => {
    it("should normalize standard headers", () => {
      expect(normalizeHeader("name")).toBe("name");
      expect(normalizeHeader("company")).toBe("company");
      expect(normalizeHeader("email")).toBe("email");
    });

    it("should normalize varied header formats", () => {
      expect(normalizeHeader("Full Name")).toBe("name");
      expect(normalizeHeader("full_name")).toBe("name");
      expect(normalizeHeader("Company Name")).toBe("company");
      expect(normalizeHeader("company_name")).toBe("company");
      expect(normalizeHeader("Job Title")).toBe("title");
      expect(normalizeHeader("job_title")).toBe("title");
    });

    it("should normalize LinkedIn URL variations", () => {
      expect(normalizeHeader("linkedin_url")).toBe("linkedinUrl");
      expect(normalizeHeader("LinkedIn")).toBe("linkedinUrl");
      expect(normalizeHeader("LinkedIn URL")).toBe("linkedinUrl");
    });

    it("should normalize scoring field headers", () => {
      expect(normalizeHeader("company_size")).toBe("companySize");
      expect(normalizeHeader("tech_stack_match")).toBe("techStackMatch");
      expect(normalizeHeader("pain_signal_strength")).toBe("painSignalStrength");
      expect(normalizeHeader("decision_maker_access")).toBe("decisionMakerAccess");
      expect(normalizeHeader("engagement_signals")).toBe("engagementSignals");
      expect(normalizeHeader("segment_fit")).toBe("segmentFit");
    });

    it("should handle whitespace in headers", () => {
      expect(normalizeHeader("  name  ")).toBe("name");
      expect(normalizeHeader("  Company  ")).toBe("company");
    });

    it("should return null for unknown headers", () => {
      expect(normalizeHeader("random_column")).toBeNull();
      expect(normalizeHeader("xyz")).toBeNull();
    });
  });

  describe("validateRow", () => {
    it("should validate a complete row", () => {
      const result = validateRow({ name: "John", company: "Acme" }, 1);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject row missing name", () => {
      const result = validateRow({ company: "Acme" }, 1);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Missing required field: name");
    });

    it("should reject row missing company", () => {
      const result = validateRow({ name: "John" }, 1);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Missing required field: company");
    });

    it("should reject row with empty name", () => {
      const result = validateRow({ name: "", company: "Acme" }, 1);
      expect(result.valid).toBe(false);
    });

    it("should reject row with whitespace-only name", () => {
      const result = validateRow({ name: "   ", company: "Acme" }, 1);
      expect(result.valid).toBe(false);
    });

    it("should validate email format when present", () => {
      const validResult = validateRow(
        { name: "John", company: "Acme", email: "john@acme.com" },
        1
      );
      expect(validResult.valid).toBe(true);

      const invalidResult = validateRow(
        { name: "John", company: "Acme", email: "not-an-email" },
        1
      );
      expect(invalidResult.valid).toBe(false);
      expect(invalidResult.errors[0]).toContain("Invalid email format");
    });

    it("should accept row without email (email is optional)", () => {
      const result = validateRow({ name: "John", company: "Acme" }, 1);
      expect(result.valid).toBe(true);
    });

    it("should report multiple errors at once", () => {
      const result = validateRow({}, 1);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("parseCsvRows", () => {
    it("should parse valid CSV data", () => {
      const headers = ["name", "company", "email"];
      const rows = [
        ["Alice", "AliceCorp", "alice@corp.com"],
        ["Bob", "BobInc", "bob@inc.com"],
      ];
      const { leads, result } = parseCsvRows(headers, rows);
      expect(leads).toHaveLength(2);
      expect(result.imported).toBe(2);
      expect(result.skipped).toBe(0);
      expect(result.errors).toHaveLength(0);
      expect(leads[0].name).toBe("Alice");
      expect(leads[0].company).toBe("AliceCorp");
      expect(leads[0].email).toBe("alice@corp.com");
    });

    it("should skip invalid rows and track errors", () => {
      const headers = ["name", "company"];
      const rows = [
        ["Alice", "AliceCorp"],
        ["", "BobInc"], // missing name
        ["Charlie", ""], // missing company
      ];
      const { leads, result } = parseCsvRows(headers, rows);
      expect(leads).toHaveLength(1);
      expect(result.imported).toBe(1);
      expect(result.skipped).toBe(2);
      expect(result.errors).toHaveLength(2);
    });

    it("should map varied headers correctly", () => {
      const headers = ["Full Name", "Company Name", "Job Title", "LinkedIn URL"];
      const rows = [
        ["Alice Smith", "AliceCorp", "CTO", "https://linkedin.com/in/alice"],
      ];
      const { leads } = parseCsvRows(headers, rows);
      expect(leads).toHaveLength(1);
      expect(leads[0].name).toBe("Alice Smith");
      expect(leads[0].company).toBe("AliceCorp");
      expect(leads[0].title).toBe("CTO");
      expect(leads[0].linkedinUrl).toBe("https://linkedin.com/in/alice");
    });

    it("should handle empty rows array", () => {
      const headers = ["name", "company"];
      const rows: string[][] = [];
      const { leads, result } = parseCsvRows(headers, rows);
      expect(leads).toHaveLength(0);
      expect(result.imported).toBe(0);
      expect(result.skipped).toBe(0);
    });

    it("should trim whitespace from values", () => {
      const headers = ["name", "company"];
      const rows = [["  Alice  ", "  AliceCorp  "]];
      const { leads } = parseCsvRows(headers, rows);
      expect(leads[0].name).toBe("Alice");
      expect(leads[0].company).toBe("AliceCorp");
    });

    it("should ignore unrecognized columns", () => {
      const headers = ["name", "company", "random_field", "another"];
      const rows = [["Alice", "AliceCorp", "value1", "value2"]];
      const { leads } = parseCsvRows(headers, rows);
      expect(leads).toHaveLength(1);
      expect(leads[0].name).toBe("Alice");
      expect(leads[0]).not.toHaveProperty("random_field");
    });

    it("should parse scoring fields from CSV", () => {
      const headers = [
        "name",
        "company",
        "company_size",
        "tech_stack_match",
        "pain_signal_strength",
      ];
      const rows = [["Alice", "AliceCorp", "enterprise", "strong", "explicit"]];
      const { leads } = parseCsvRows(headers, rows);
      expect(leads[0].companySize).toBe("enterprise");
      expect(leads[0].techStackMatch).toBe("strong");
      expect(leads[0].painSignalStrength).toBe("explicit");
    });

    it("should use correct row numbers in error reporting (1-based + header)", () => {
      const headers = ["name", "company"];
      const rows = [
        ["Alice", "AliceCorp"],
        ["", ""], // row 2 in data, row 3 in file (header + 1-based)
      ];
      const { result } = parseCsvRows(headers, rows);
      expect(result.errors[0].row).toBe(3); // header row + data row 2 = row 3
    });
  });
});
