import type { Report } from "@/lib/report";

// Dates are plain YYYY-MM-DD; format in UTC so they don't shift a day in negative-offset timezones.
const dateFmt = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "UTC" });
const formatDate = (d: string) => dateFmt.format(new Date(d));
const formatMiles = (n: number) => `${n.toLocaleString("en-US")} mi`;

const SEVERITY_STYLES: Record<string, string> = {
  minor: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
  moderate: "bg-orange-100 text-orange-900 dark:bg-orange-950 dark:text-orange-200",
  major: "bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-200",
};

export default function ReportView({ report }: { report: Report }) {
  const rollbacks = report.mileageHistory.filter((r) => r.rollback).length;

  return (
    <article className="flex flex-col gap-6">
      <header>
        <h2 className="text-xl font-semibold">
          {report.year} {report.make} {report.model}
        </h2>
        <p className="font-mono text-sm break-all text-zinc-500">{report.vin}</p>
      </header>

      {report.rollbackDetected && (
        <div role="alert" className="flex gap-3 rounded-md border border-red-300 bg-red-50 p-4 text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-100">
          <svg aria-hidden="true" viewBox="0 0 24 24" className="size-6 shrink-0 fill-current">
            <path d="M12 2 1 21h22L12 2Zm1 15h-2v-2h2v2Zm0-4h-2V9h2v4Z" />
          </svg>
          <div>
            <p className="font-semibold">Possible odometer rollback</p>
            <p className="text-sm">
              {rollbacks === 1 ? "1 mileage reading is" : `${rollbacks} mileage readings are`} lower than an
              earlier reading. The odometer may have been tampered with.
            </p>
          </div>
        </div>
      )}

      <section>
        <h3 className="mb-2 font-semibold">Mileage history</h3>
        {report.mileageHistory.length === 0 ? (
          <p className="text-zinc-500">No mileage records.</p>
        ) : (
          <table className="w-full text-left">
            <thead className="border-b border-zinc-300 text-sm text-zinc-500 dark:border-zinc-700">
              <tr>
                <th scope="col" className="py-2 font-medium">Date</th>
                <th scope="col" className="py-2 text-right font-medium">Mileage</th>
              </tr>
            </thead>
            <tbody>
              {report.mileageHistory.map((r) => (
                <tr
                  key={r.date}
                  className={`border-b border-zinc-200 dark:border-zinc-800 ${r.rollback ? "bg-red-50 dark:bg-red-950/60" : ""}`}
                >
                  <td className="py-2 pl-1">{formatDate(r.date)}</td>
                  <td className="py-2 pr-1 text-right tabular-nums">
                    {r.rollback && (
                      <span className="mr-2 rounded bg-red-600 px-1.5 py-0.5 text-xs font-medium text-white">
                        Rollback
                      </span>
                    )}
                    {formatMiles(r.mileage)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section>
        <h3 className="mb-2 font-semibold">Accident history</h3>
        {report.accidents.length === 0 ? (
          <p className="text-zinc-500">No accidents reported.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {report.accidents.map((a) => (
              <li key={a.date + a.description} className="rounded-md border border-zinc-200 p-3 dark:border-zinc-800">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm text-zinc-500">{formatDate(a.date)}</span>
                  <span className={`rounded px-1.5 py-0.5 text-xs font-medium capitalize ${SEVERITY_STYLES[a.severity] ?? ""}`}>
                    {a.severity}
                  </span>
                </div>
                <p className="mt-1">{a.description}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </article>
  );
}
