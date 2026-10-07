import { card } from "./styles";

const bar = "animate-pulse rounded-md bg-zinc-100";

// Placeholder in the shape of ReportView while a lookup is in flight.
export default function ReportSkeleton() {
  return (
    <div aria-hidden="true" className={`${card} flex flex-col gap-7 p-5 sm:p-7`}>
      <div className="flex flex-col gap-2">
        <div className={`${bar} h-8 w-60`} />
        <div className={`${bar} h-4 w-44`} />
      </div>
      <div className="grid gap-3 sm:grid-cols-4">
        <div className={`${bar} h-20 rounded-xl sm:col-span-2`} />
        <div className={`${bar} h-20 rounded-xl`} />
        <div className={`${bar} h-20 rounded-xl`} />
      </div>
      <div className="flex flex-col gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`${bar} h-5`} />
        ))}
      </div>
    </div>
  );
}
