import VinSearch from "./vin-search";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-4 sm:py-12">
      <h1 className="text-2xl font-semibold">VIN Check</h1>
      <VinSearch />
    </main>
  );
}
