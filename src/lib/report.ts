import vehicles from "@/data/vehicles.json";

export type MileageRecord = { date: string; mileage: number };

// A reading is a rollback if it's lower than any earlier reading (by date).
export function findRollbacks(records: MileageRecord[]) {
  const sorted = records.toSorted((a, b) => a.date.localeCompare(b.date));
  let max = -Infinity;
  return sorted.map((r) => {
    const rollback = r.mileage < max;
    max = Math.max(max, r.mileage);
    return { ...r, rollback };
  });
}

// Expects a VIN already normalized by validateVin.
export function getReport(vin: string) {
  const v = vehicles.find((v) => v.vin === vin);
  if (!v) return null;
  const mileageHistory = findRollbacks(v.mileageRecords);
  return {
    vin: v.vin,
    make: v.make,
    model: v.model,
    year: v.year,
    mileageHistory,
    accidents: v.accidentRecords,
    rollbackDetected: mileageHistory.some((r) => r.rollback),
  };
}

export type Report = NonNullable<ReturnType<typeof getReport>>;
