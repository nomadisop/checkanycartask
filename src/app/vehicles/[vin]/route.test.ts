import { describe, expect, it } from "vitest";
import { GET } from "./route";

const get = (vin: string) =>
  GET(new Request(`http://localhost/vehicles/${vin}`), { params: Promise.resolve({ vin }) });

describe("GET /vehicles/:vin", () => {
  it("returns 200 with the report", async () => {
    const res = await get("1FTFW1ET9DFC10312");
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({
      vin: "1FTFW1ET9DFC10312",
      make: "Ford",
      model: "F-150",
      year: 2013,
      rollbackDetected: true,
    });
  });

  it("normalizes the VIN before lookup", async () => {
    expect((await get("1ftfw1et9dfc10312")).status).toBe(200);
  });

  it("returns 400 with a reason for an invalid VIN", async () => {
    const res = await get("ABC");
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Invalid VIN", reason: expect.any(String) });
  });

  it("returns 404 for a valid VIN that isn't in the data", async () => {
    const res = await get("2HGCM82603A004352");
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: "Vehicle not found" });
  });
});
