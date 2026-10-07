import { describe, expect, it } from "vitest";
import { findRollbacks, getReport } from "./report";

const flags = (...readings: [string, number][]) =>
  findRollbacks(readings.map(([date, mileage]) => ({ date, mileage }))).map((r) => r.rollback);

describe("findRollbacks", () => {
  it("flags nothing when mileage only goes up", () => {
    expect(flags(["2020-01-01", 100], ["2021-01-01", 200], ["2022-01-01", 300])).toEqual([false, false, false]);
  });

  it("treats an unchanged reading as no rollback", () => {
    expect(flags(["2020-01-01", 100], ["2021-01-01", 100])).toEqual([false, false]);
  });

  it("flags a reading lower than an earlier one", () => {
    expect(flags(["2020-01-01", 500], ["2021-01-01", 300])).toEqual([false, true]);
  });

  it("keeps flagging until the previous peak is passed", () => {
    expect(
      flags(["2020-01-01", 500], ["2021-01-01", 300], ["2022-01-01", 400], ["2023-01-01", 600]),
    ).toEqual([false, true, true, false]);
  });

  it("sorts by date before comparing", () => {
    const result = findRollbacks([
      { date: "2022-01-01", mileage: 300 },
      { date: "2020-01-01", mileage: 100 },
    ]);
    expect(result.map((r) => r.date)).toEqual(["2020-01-01", "2022-01-01"]);
    expect(result.some((r) => r.rollback)).toBe(false);
  });

  it("handles empty and single-record histories", () => {
    expect(flags()).toEqual([]);
    expect(flags(["2020-01-01", 100])).toEqual([false]);
  });
});

describe("getReport", () => {
  it("returns null for an unknown VIN", () => {
    expect(getReport("2HGCM82603A004352")).toBeNull();
  });

  it("sets rollbackDetected from the mileage history", () => {
    expect(getReport("1HGCM82633A004352")?.rollbackDetected).toBe(false);
    expect(getReport("1FTFW1ET9DFC10312")?.rollbackDetected).toBe(true);
  });
});
