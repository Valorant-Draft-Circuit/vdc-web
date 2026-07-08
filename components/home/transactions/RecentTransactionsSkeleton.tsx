export default function RecentTransactionsSkeleton() {
  return (
    <section>
      <div className="px-4 py-2 mt-5 sm:px-6 text-lg lg:text-xl">
        <h1>Recent Transactions</h1>
      </div>
      <div className="px-4 py-2 sm:px-6">
        <div className="rounded-md bg-slate-100 dark:bg-vdcGrey p-4 sm:p-5">
          <div className="hidden md:grid md:grid-cols-2 xl:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-80 rounded-md bg-vdcWhite/40 dark:bg-vdcBlack/40 animate-pulse"
              />
            ))}
          </div>
          <div className="md:hidden flex flex-col gap-3">
            <div className="h-10 rounded-md bg-vdcWhite/40 dark:bg-vdcBlack/40 animate-pulse" />
            <div className="h-80 rounded-md bg-vdcWhite/40 dark:bg-vdcBlack/40 animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
}
