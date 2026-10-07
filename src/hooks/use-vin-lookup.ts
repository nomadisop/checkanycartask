import { useState } from "react";
import { validateVin } from "@/lib/vin";
import type { Report } from "@/lib/report";

const SLOW_MS = 3000;
const TIMEOUT_MS = 10000;

export type LookupState =
  | { kind: "idle" }
  | { kind: "loading"; slow: boolean }
  | { kind: "invalid"; reason: string }
  | { kind: "notFound"; vin: string }
  | { kind: "error"; message: string }
  | { kind: "done"; report: Report };

// Validates the VIN, calls the API and maps every outcome to a LookupState.
export function useVinLookup() {
  const [state, setState] = useState<LookupState>({ kind: "idle" });

  async function lookup(input: string) {
    const result = validateVin(input);
    if (!result.ok) {
      setState({ kind: "invalid", reason: result.reason });
      return;
    }

    setState({ kind: "loading", slow: false });
    const slowTimer = setTimeout(
      () => setState((s) => (s.kind === "loading" ? { ...s, slow: true } : s)),
      SLOW_MS,
    );
    try {
      const res = await fetch(`/vehicles/${result.vin}`, { signal: AbortSignal.timeout(TIMEOUT_MS) });
      if (res.status === 400) {
        setState({ kind: "invalid", reason: (await res.json()).reason });
      } else if (res.status === 404) {
        setState({ kind: "notFound", vin: result.vin });
      } else if (!res.ok) {
        setState({ kind: "error", message: "Something went wrong on our side. Please try again." });
      } else {
        setState({ kind: "done", report: await res.json() });
      }
    } catch (e) {
      const timedOut = e instanceof DOMException && e.name === "TimeoutError";
      setState({
        kind: "error",
        message: timedOut
          ? "The request took too long. Please try again."
          : "Couldn't reach the server. Check your connection and try again.",
      });
    } finally {
      clearTimeout(slowTimer);
    }
  }

  return { state, lookup, reset: () => setState({ kind: "idle" }) };
}
