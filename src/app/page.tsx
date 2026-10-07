import VinSearch from "@/components/vin-search";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-4 pt-12 pb-20 sm:pt-20">
      <header className="flex flex-col gap-4">
        <p className="text-sm font-medium text-emerald-700">Vehicle history check</p>
        <h1 className="text-4xl leading-[1.1] font-semibold tracking-tight text-balance sm:text-5xl">
          Check a VIN before you buy
        </h1>
        <p className="max-w-[55ch] text-lg leading-relaxed text-pretty text-zinc-600">
          Enter a 17-character VIN to see odometer history, rollback warnings and accident records.
        </p>
      </header>
      <VinSearch />
    </main>
  );
}
