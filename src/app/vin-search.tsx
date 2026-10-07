"use client";

import { useState } from "react";
import { validateVin } from "@/lib/vin";
import type { Report } from "@/lib/report";
import ReportView from "./report-view";

const SLOW_MS = 3000;
const TIMEOUT_MS = 10000;

type State =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "invalid"; reason: string }
  | { kind: "notFound"; vin: string }
  | { kind: "error"; message: string }
  | { kind: "done"; report: Report };

export default function VinSearch() {
  const [input, setInput] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });
  const [slow, setSlow] = useState(false);

  async function lookup() {
    const result = validateVin(input);
    if (!result.ok) {
      setState({ kind: "invalid", reason: result.reason });
      return;
    }

    setState({ kind: "loading" });
    const slowTimer = setTimeout(() => setSlow(true), SLOW_MS);
    try {
      const res = await fetch(`/vehicles/${result.vin}`, { signal: AbortSignal.timeout(TIMEOUT_MS) });
      if (res.status === 400) {
        const body = await res.json();
        setState({ kind: "invalid", reason: body.reason });
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
      setSlow(false);
    }
  }

  const loading = state.kind === "loading";
  const invalid = state.kind === "invalid";

  return (
    <div className="flex flex-col gap-6">
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          lookup();
        }}
        className="flex flex-col gap-2"
      >
        <label htmlFor="vin" className="font-medium">
          Vehicle Identification Number (VIN)
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            id="vin"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              if (invalid) setState({ kind: "idle" });
            }}
            placeholder="e.g. 1HGCM82633A004352"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            aria-invalid={invalid}
            aria-describedby={invalid ? "vin-error" : "vin-hint"}
            className="flex-1 rounded-md border border-zinc-300 bg-white px-3 py-2 font-mono uppercase placeholder:normal-case placeholder:font-sans aria-invalid:border-red-600 dark:border-zinc-700 dark:bg-zinc-900"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-zinc-900 px-4 py-2 font-medium text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
          >
            {loading ? "Checking…" : "Check VIN"}
          </button>
        </div>
        {invalid ? (
          <p id="vin-error" role="alert" className="text-sm text-red-700 dark:text-red-400">
            {state.reason}
          </p>
        ) : (
          <p id="vin-hint" className="text-sm text-zinc-500">
            17 characters, letters and numbers. Never contains I, O or Q.
          </p>
        )}
      </form>

      <div aria-live="polite">
        {loading && (
          <p className="text-zinc-600 dark:text-zinc-400">
            {slow ? "This is taking longer than usual, still trying…" : "Looking up vehicle…"}
          </p>
        )}

        {state.kind === "notFound" && (
          <p className="rounded-md border border-zinc-300 p-4 dark:border-zinc-700">
            No record found for <span className="font-mono">{state.vin}</span>. Check the VIN and try again.
          </p>
        )}

        {state.kind === "error" && (
          <div role="alert" className="flex flex-col items-start gap-3 rounded-md border border-red-300 bg-red-50 p-4 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
            <p>{state.message}</p>
            <button type="button" onClick={lookup} className="rounded-md border border-current px-3 py-1 text-sm font-medium">
              Retry
            </button>
          </div>
        )}

        {state.kind === "done" && <ReportView report={state.report} />}
      </div>
    </div>
  );
}
