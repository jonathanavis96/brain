import { describe, it, expect } from "vitest";
import { getProjectFromRequest } from "@/lib/activeProject";

describe("getProjectFromRequest", () => {
  it("reads project from X-Project header", () => {
    const req = new Request("http://localhost/api/leads", {
      headers: { "X-Project": "acme-corp" },
    });
    expect(getProjectFromRequest(req)).toBe("acme-corp");
  });

  it("reads project from query parameter", () => {
    const req = new Request("http://localhost/api/leads?project=beta-corp");
    expect(getProjectFromRequest(req)).toBe("beta-corp");
  });

  it("prefers header over query parameter", () => {
    const req = new Request("http://localhost/api/leads?project=query-val", {
      headers: { "X-Project": "header-val" },
    });
    expect(getProjectFromRequest(req)).toBe("header-val");
  });

  it("defaults to 'default' when neither is set", () => {
    const req = new Request("http://localhost/api/leads");
    expect(getProjectFromRequest(req)).toBe("default");
  });
});
