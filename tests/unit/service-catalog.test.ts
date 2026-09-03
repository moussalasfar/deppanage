import { describe, expect, it } from "vitest";
import {
  isServiceCategoryId,
  serviceCategories,
} from "@/modules/requests/domain/service-catalog";

describe("service catalog", () => {
  it("exposes unique selectable service identifiers", () => {
    const identifiers = serviceCategories.map((service) => service.id);

    expect(new Set(identifiers).size).toBe(identifiers.length);
    expect(identifiers).toContain("towing");
  });

  it("rejects unsupported service identifiers", () => {
    expect(isServiceCategoryId("battery")).toBe(true);
    expect(isServiceCategoryId("home-plumbing")).toBe(false);
  });
});
