import { describe, expect, it } from "vitest";
import { normalizeMoroccanPhone } from "@/modules/auth/domain/phone-number";

describe("normalizeMoroccanPhone", () => {
  it.each([
    ["06 12 34 56 78", "+212612345678"],
    ["07-12-34-56-78", "+212712345678"],
    ["00212612345678", "+212612345678"],
    ["+212 7 12 34 56 78", "+212712345678"],
  ])("normalizes %s", (input, expected) => {
    expect(normalizeMoroccanPhone(input)).toBe(expected);
  });

  it.each(["", "0512345678", "061234567", "+33612345678"])(
    "rejects %s",
    (input) => {
      expect(() => normalizeMoroccanPhone(input)).toThrow();
    },
  );
});
