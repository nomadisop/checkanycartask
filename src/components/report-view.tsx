import { CheckCircleIcon, WarningIcon } from "@phosphor-icons/react";
import type { Report } from "@/lib/report";
import { formatDate, formatKm } from "@/lib/format";
import Alert from "./alert";
import MileageHistory from "./mileage-history";
import AccidentHistory from "./accident-history";
import { card } from "./styles";

export default function ReportView({ report }: { report: Report }) {
  const { mileageHistory, accidents, rollbackDetected } = report;
  const rollbacks = mileageHistory.filter((r) => r.rollback).length;
  const latest = mileageHistory.at(-1);

  return (
    <article className={`${card} flex flex-col gap-7 p-5 motion-safe:animate-fade-up sm:p-7`}>
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {report.year} {report.make} {report.model}
          </h2>
          <p className="mt-1 font-mono text-sm break-all text-zinc-500">{report.vin}</p>
        </div>
        {rollbackDetected ? (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-red-600 px-2.5 py-1 text-sm font-medium text-white">
            <WarningIcon size={16} weight="fill" aria-hidden="true" />
            Rollback detected
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 py-1 text-sm font-medium text-emerald-800 ring-1 ring-emerald-200">
            <CheckCircleIcon size={16} weight="fill" aria-hidden="true" />
            Odometer consistent
          </span>
        )}
      </header>

      {rollbackDetected && (
        <Alert tone="danger" title="Possible odometer rollback">
          {rollbacks === 1 ? "1 reading is" : `${rollbacks} readings are`} lower than an earlier reading. The odometer
          may have been tampered with, so treat the current reading with caution.
        </Alert>
      )}

      <dl className="grid gap-3 sm:grid-cols-4">
        <Stat
          className="sm:col-span-2"
          label="Latest reading"
          value={latest ? formatKm(latest.mileage) : "None"}
          note={latest && `Recorded ${formatDate(latest.date)}`}
        />
        <Stat label="Odometer records" value={String(mileageHistory.length)} note={rollbacks ? `${rollbacks} flagged` : "None flagged"} />
        <Stat label="Accidents" value={String(accidents.length)} note={accidents.length ? "See below" : "None reported"} />
      </dl>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold tracking-tight">Mileage history</h3>
        <MileageHistory records={mileageHistory} />
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold tracking-tight">Accident history</h3>
        <AccidentHistory accidents={accidents} />
      </section>
    </article>
  );
}

function Stat({ label, value, note, className = "" }: { label: string; value: string; note?: string; className?: string }) {
  return (
    <div className={`rounded-xl bg-zinc-50 p-4 ring-1 ring-zinc-100 ${className}`}>
      <dt className="text-sm text-zinc-600">{label}</dt>
      <dd className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">{value}</dd>
      {note && <dd className="mt-0.5 text-sm text-zinc-500">{note}</dd>}
    </div>
  );
}
