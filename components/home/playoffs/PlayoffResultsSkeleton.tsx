export default function PlayoffResultsSkeleton() {
  return (
    <section className="relative z-20">
      <div className="mt-5 px-4 py-2 text-lg sm:px-6 lg:text-xl">
        <h1>Playoffs</h1>
      </div>
      <div className="px-4 py-2 sm:px-6">
        <div className="flex flex-col gap-4 rounded-md bg-slate-100 p-4 dark:bg-vdcGrey sm:p-5">
          <div className="flex flex-wrap gap-1.5">
            {[0, 1, 2, 3, 4, 5].map((pill) => (
              <div
                key={pill}
                className="h-7 w-20 animate-pulse rounded-full bg-slate-200 dark:bg-vdcBlack/40"
              />
            ))}
          </div>
          <div className="h-72 animate-pulse rounded-2xl bg-slate-200 dark:bg-vdcBlack/40" />
        </div>
      </div>
    </section>
  );
}
