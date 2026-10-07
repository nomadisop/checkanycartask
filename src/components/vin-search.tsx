"use client";

import { useState } from "react";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { useVinLookup } from "@/hooks/use-vin-lookup";
import Alert from "./alert";
import ReportView from "./report-view";
import ReportSkeleton from "./report-skeleton";
import { card, focusRing } from "./styles";

// VINs from the sample data, so reviewers can try each state without typing.
const SAMPLES = [
  { vin: "1HGCM82633A004352", label: "Clean history" },
  { vin: "1FTFW1ET9DFC10312", label: "Odometer rollback" },
  { vin: "JM1BK32F481123456", label: "Rollback and accidents" },
  { vin: "2HGCM82603A004352", label: "Not in records" },
];

const control = `rounded-lg font-medium transition duration-200 active:scale-[0.98] ${focusRing}`;

export default function VinSearch() {
  const [input, setInput] = useState("");
  const { state, lookup, reset } = useVinLookup();

  const loading = state.kind === "loading";
  const invalid = state.kind === "invalid";
  const length = input.trim().length;

  function run(vin: string) {
    setInput(vin);
    lookup(vin);
  }

  return (
    <div className="flex flex-col gap-6">
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          lookup(input);
        }}
        className={`${card} flex flex-col gap-3 p-5 sm:p-7`}
      >
        <div className="flex items-baseline justify-between gap-2">
          <label htmlFor="vin" className="font-medium">
            Vehicle Identification Number
          </label>
          <span aria-hidden="true" className={`text-sm tabular-nums ${length === 17 ? "font-medium text-emerald-700" : "text-zinc-500"}`}>
            {length}/17
          </span>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            id="vin"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              if (invalid) reset();
            }}
            placeholder="e.g. 1HGCM82633A004352"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            aria-invalid={invalid}
            aria-describedby={invalid ? "vin-error" : "vin-hint"}
            className="h-12 min-w-0 flex-1 rounded-lg border border-zinc-300 bg-zinc-50/50 px-3.5 font-mono text-lg tracking-wider uppercase transition duration-200 placeholder:font-sans placeholder:text-base placeholder:tracking-normal placeholder:text-zinc-500 placeholder:normal-case hover:border-zinc-400 focus-visible:border-emerald-600 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-emerald-600/15 focus-visible:outline-none aria-invalid:border-red-600 aria-invalid:ring-red-600/15"
          />
          <button
            type="submit"
            disabled={loading}
            className={`${control} flex h-12 items-center justify-center gap-2 bg-emerald-700 px-6 text-white shadow-sm hover:bg-emerald-800 disabled:pointer-events-none disabled:opacity-60`}
          >
            <MagnifyingGlassIcon size={18} weight="bold" aria-hidden="true" />
            {loading ? "Checking…" : "Check VIN"}
          </button>
        </div>
        {invalid ? (
          <p id="vin-error" role="alert" className="text-sm text-red-700">
            {state.reason}
          </p>
        ) : (
          <p id="vin-hint" className="text-sm text-zinc-600">
            Letters and numbers only. VINs never contain I, O or Q.
          </p>
        )}

        <div className="mt-2 flex flex-col gap-2.5 border-t border-zinc-100 pt-5">
          <p className="text-sm text-zinc-600">No VIN to hand? Try a sample:</p>
          <ul className="flex flex-wrap gap-2">
            {SAMPLES.map((s) => (
              <li key={s.vin}>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => run(s.vin)}
                  className={`${control} border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 hover:border-emerald-600/40 hover:bg-emerald-50 hover:text-emerald-800 disabled:opacity-60`}
                >
                  {s.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </form>

      <div aria-live="polite">
        {state.kind === "loading" && (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-zinc-600">
              {state.slow ? "This is taking longer than usual, still trying…" : "Looking up vehicle…"}
            </p>
            <ReportSkeleton />
          </div>
        )}

        {state.kind === "notFound" && (
          <Alert title="No record found">
            We have no report for <span className="font-mono">{state.vin}</span>. Check the VIN and try again.
          </Alert>
        )}

        {state.kind === "error" && (
          <Alert
            tone="danger"
            title="Lookup failed"
            action={
              <button
                type="button"
                onClick={() => lookup(input)}
                className={`${control} border border-red-300 bg-white px-3 py-1 text-sm text-red-800 hover:bg-red-100`}
              >
                Retry
              </button>
            }
          >
            {state.message}
          </Alert>
        )}

        {state.kind === "done" && <ReportView report={state.report} />}
      </div>
    </div>
  );
}
