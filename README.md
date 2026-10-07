# VIN Check

Enter a VIN, get a short vehicle report: make, model, year, mileage history (with odometer-rollback detection) and accident history.

A single Next.js 16 app serves both the frontend and the API.

## Run

Requires Node 22.12+ or 24.

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # unit and API tests (Vitest)
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

The home page has one-click buttons for a clean vehicle, the two rollback vehicles and the not-found VIN.

## Structure

Business logic has no framework code in it. The route and the UI only call into it.

```
src/
  lib/
    vin.ts                  VIN validation and check digit
    report.ts               lookup and rollback detection
    format.ts               date and mileage formatting
  data/vehicles.json        sample data
  app/
    vehicles/[vin]/route.ts the API: validate, look up, map to 400/404/200
    page.tsx                home page
  hooks/use-vin-lookup.ts   request state: loading, slow, invalid, not found, error, done
  components/
    vin-search.tsx          form, renders each lookup state
    report-view.tsx         the report, built from the components below
    report-skeleton.tsx     loading placeholder in the shape of the report
    mileage-history.tsx     odometer table with the change between readings and rollback rows marked
    accident-history.tsx    accident list
    alert.tsx               shared alert (error, not found, rollback warning)
```

Tests sit next to the code they cover: `lib/vin.test.ts`, `lib/report.test.ts` and `app/vehicles/[vin]/route.test.ts`.

## States

| State | Behaviour |
|---|---|
| Invalid VIN | Checked before any request is sent. The specific reason appears under the input. |
| Loading | The button is disabled and "Looking up vehicle…" is shown. |
| Slow | After 3 s the message changes to "taking longer than usual". |
| Failed | Timeout (10 s), network error or 5xx: an error with a Retry button. |
| Not found | "No record found" with the VIN. |

To see the slow and failed states, use DevTools network throttling or "Offline".

## Trade-offs

- **The data is a JSON file read at build time.** That's enough for 5 records. Real data would need a database, and `getReport` is the only function that would change.
- **The check digit is enforced.** It's only mandatory for North American VINs, so a European VIN with a "wrong" check digit would get a 400. With international data, that check should become a warning on the report rather than a rejection.
- **Rollback detection compares readings only.** It doesn't account for odometer replacements or unit mix-ups (km vs mi), and it treats all readings as kilometres. A false positive is possible if the data contains a legitimate odometer swap.
- **The report isn't linkable.** It appears on the same page, so there's no URL to share a result. A `/report/[vin]` page would add that.
- **No component or end-to-end tests.** Tests cover validation, rollback detection and the API's status codes. I tested the UI states by hand in the browser.
