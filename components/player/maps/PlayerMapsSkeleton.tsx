export default function PlayerMapsSkeleton() {
  return (
    <div className="flex flex-col gap-3 px-2 xl:px-0">
      <div className="flex gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-[88px] flex-1 rounded-xl bg-slate-100 dark:bg-vdcGrey animate-pulse"
          />
        ))}
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 xl:grid-cols-6 gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="aspect-[4/3] rounded-lg bg-slate-100 dark:bg-vdcGrey animate-pulse"
          />
        ))}
      </div>
      <div className="rounded-2xl bg-slate-100 dark:bg-vdcGrey p-4 flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-8 bg-slate-200 dark:bg-vdcBlack/40 rounded animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}
