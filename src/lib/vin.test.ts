import { describe, expect, it } from "vitest";
import { checkDigit, validateVin } from "./vin";

const VALID = "1HGCM82633A004352"; // widely published example VIN with a correct check digit

describe("validateVin", () => {
  it("accepts a valid VIN", () => {
    expect(validateVin(VALID)).toEqual({ ok: true, vin: VALID });
  });

  it("normalizes whitespace and case", () => {
    expect(validateVin(`  ${VALID.toLowerCase()} `)).toEqual({ ok: true, vin: VALID });
  });

  it.each([
    ["empty", "", /enter a VIN/],
    ["16 characters", VALID.slice(0, 16), /17 characters/],
    ["18 characters", VALID + "1", /17 characters/],
    ["contains I", "1HGCM82633A00435I", /I, O or Q/],
    ["contains O", "1HGCM82633AO04352", /I, O or Q/],
    ["contains Q", "1HGCM82633A00435Q", /I, O or Q/],
    ["contains a symbol", "1HGCM82633A00435-", /letters and numbers/],
    ["wrong check digit", "1HGCM82643A004352", /check digit/],
  ])("rejects %s", (_, input, reason) => {
    const result = validateVin(input);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(reason);
  });
});

describe("checkDigit", () => {
  it("computes the published check digit", () => {
    expect(checkDigit(VALID)).toBe("3");
  });

  it("returns X when the remainder is 10", () => {
    // Position 9 is weighted 0, so its value doesn't affect the result.
    expect(checkDigit("1M8GDM9AXKP042788")).toBe("X");
  });
});
