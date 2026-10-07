import type { Report } from "@/lib/report";
import { formatDate } from "@/lib/format";

// Neutral for minor, warmer as severity rises.
const SEVERITY_STYLES: Record<string, string> = {
  minor: "bg-zinc-100 text-zinc-700",
  moderate: "bg-amber-100 text-amber-900",
  major: "bg-red-100 text-red-900",
};

export default function AccidentHistory({ accidents }: { accidents: Report["accidents"] }) {
  if (accidents.length === 0) return <p className="text-zinc-600">No accidents reported.</p>;

  return (
    <ul className="flex flex-col divide-y divide-zinc-100">
      {accidents.map((a) => (
        <li key={a.date + a.description} className="flex flex-col gap-1 py-3 first:pt-0">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm text-zinc-500">{formatDate(a.date)}</span>
            <span className={`rounded-md px-1.5 py-0.5 text-xs font-medium capitalize ${SEVERITY_STYLES[a.severity] ?? SEVERITY_STYLES.minor}`}>
              {a.severity}
            </span>
          </div>
          <p>{a.description}</p>
        </li>
      ))}
    </ul>
  );
}
