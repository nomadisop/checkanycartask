# VIN Check

Enter a VIN, get a short vehicle report: make, model, year, mileage history (with odometer-rollback detection) and accident history.

Next.js 16 app. One project serves both the frontend and the API.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
```

Production: `npm run build && npm start`.

## API

`GET /vehicles/:vin`

| Status | When | Body |
|---|---|---|
| 200 | VIN found | `{ vin, make, model, year, mileageHistory: [{ date, mileage, rollback }], accidents: [{ date, description, severity }], rollbackDetected }` |
| 400 | VIN is invalid | `{ error: "Invalid VIN", reason }` |
| 404 | Valid VIN, not in the data | `{ error: "Vehicle not found" }` |

```bash
curl localhost:3000/vehicles/1FTFW1ET9DFC10312
```

## Rules

- **VIN validation**: the VIN is trimmed and uppercased, then checked for 17 characters, letters and numbers only, and no I, O or Q. It must also have a valid check digit (position 9, using ISO 3779 weights, mod 11). The same function runs in the form, before any request, and in the API.
- **Rollback detection**: readings are sorted by date. A reading is flagged when it's lower than the highest earlier reading, so every reading after a rollback stays flagged until the odometer passes its previous peak.

## Sample data

`src/data/vehicles.json` holds 5 sample vehicles:

| VIN | Vehicle | What it shows |
|---|---|---|
| `1HGCM82633A004352` | 2003 Honda Accord | Clean history |
| `4T1BF1FK0CU123456` | 2012 Toyota Camry | One minor accident |
| `1FTFW1ET9DFC10312` | 2013 Ford F-150 | Rollback (2 readings) and a major accident |
| `WBA3A5C53CF256985` | 2012 BMW 328i | Records stored out of date order |
| `JM1BK32F481123456` | 2008 Mazda Mazda3 | Rollback that later recovers, two accidents |

Valid but unknown, for the 404 state: `2HGCM82603A004352`.

## Layout

```
src/
  lib/vin.ts                  VIN validation and check digit
  lib/report.ts               lookup and rollback detection
  data/vehicles.json          sample data
  app/vehicles/[vin]/route.ts the API
  app/page.tsx                home page
  app/vin-search.tsx          form and loading, slow, invalid, not-found and error states
  app/report-view.tsx         the report
```

## Notes

- Requests show a "taking longer than usual" message after 3 s and time out at 10 s, with a Retry button. Use DevTools network throttling or "Offline" to see these states.
- The check digit is only mandatory for North American VINs. If real data includes other VINs, the check-digit failure should become a warning rather than a 400.
