// ISO 3779 transliteration: letters map to digits for the check-digit sum.
const VALUES: Record<string, number> = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8,
  J: 1, K: 2, L: 3, M: 4, N: 5, P: 7, R: 9,
  S: 2, T: 3, U: 4, V: 5, W: 6, X: 7, Y: 8, Z: 9,
};
const WEIGHTS = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];

export function checkDigit(vin: string): string {
  let sum = 0;
  for (let i = 0; i < 17; i++) {
    const c = vin[i];
    sum += (c >= "0" && c <= "9" ? Number(c) : VALUES[c]) * WEIGHTS[i];
  }
  const r = sum % 11;
  return r === 10 ? "X" : String(r);
}

export type VinResult = { ok: true; vin: string } | { ok: false; reason: string };

export function validateVin(input: string): VinResult {
  const vin = input.trim().toUpperCase();
  if (!vin) return { ok: false, reason: "Please enter a VIN." };
  if (vin.length !== 17) return { ok: false, reason: "A VIN must be exactly 17 characters." };
  if (/[IOQ]/.test(vin)) return { ok: false, reason: "A VIN can't contain the letters I, O or Q." };
  if (!/^[A-Z0-9]+$/.test(vin)) return { ok: false, reason: "A VIN can only contain letters and numbers." };
  if (vin[8] !== checkDigit(vin)) return { ok: false, reason: "This VIN's check digit doesn't match. Please check for typos." };
  return { ok: true, vin };
}
