import type { Report } from "@/lib/report";
import { formatDate, formatKm, formatKmDelta } from "@/lib/format";

export default function MileageHistory({ records }: { records: Report["mileageHistory"] }) {
  if (records.length === 0) return <p className="text-zinc-600">No mileage records.</p>;

  return (
    <table className="w-full text-left text-sm sm:text-base">
      <thead className="border-b border-zinc-200 text-xs text-zinc-500">
        <tr>
          <th scope="col" className="py-2 pl-3 font-medium">Date</th>
          <th scope="col" className="py-2 text-right font-medium">Odometer</th>
          <th scope="col" className="py-2 pr-3 text-right font-medium">Change</th>
        </tr>
      </thead>
      <tbody>
        {records.map((r, i) => {
          const delta = i === 0 ? null : r.mileage - records[i - 1].mileage;
          return (
            <tr key={r.date} className={`border-b border-zinc-100 last:border-0 ${r.rollback ? "bg-red-50/80" : ""}`}>
              <td className="py-3 pl-3">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  {formatDate(r.date)}
                  {r.rollback && (
                    <span className="rounded-md bg-red-600 px-1.5 py-0.5 text-xs font-medium text-white">Rollback</span>
                  )}
                </div>
              </td>
              <td className="py-3 text-right font-medium tabular-nums">{formatKm(r.mileage)}</td>
              <td
                className={`py-3 pr-3 text-right tabular-nums ${
                  delta !== null && delta < 0 ? "font-semibold text-red-700" : "text-zinc-500"
                }`}
              >
                {delta === null ? "First record" : formatKmDelta(delta)}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
