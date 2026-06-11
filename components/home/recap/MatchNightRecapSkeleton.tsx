export default function MatchNightRecapSkeleton() {
  return (
    <section>
      <div className="px-4 py-2 mt-5 sm:px-6 text-lg lg:text-xl">
        <h1>Match Date Summary</h1>
      </div>
      <div className="px-4 py-2 sm:px-6">
        <div className="flex animate-pulse flex-col gap-4 rounded-md bg-slate-100 dark:bg-vdcGrey p-4">
          <div className="flex items-center justify-between">
            <div className="h-4 w-32 rounded bg-slate-200 dark:bg-vdcBlack/40" />
            <div className="h-6 w-72 rounded-full bg-slate-200 dark:bg-vdcBlack/40" />
          </div>
          <div className="grid gap-3 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-40 rounded-md bg-slate-200 dark:bg-vdcBlack/40"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
