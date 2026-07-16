export function PlayerStatsSkeleton() {
  return (
    <div className="flex flex-col gap-3 animate-pulse px-2 xl:px-0">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 rounded-sm bg-slate-200 dark:bg-vdcGrey" />
        ))}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
        <div className="h-48 rounded-sm bg-slate-200 dark:bg-vdcGrey" />
        <div className="h-48 rounded-sm bg-slate-200 dark:bg-vdcGrey" />
      </div>
      <div className="h-32 rounded-sm bg-slate-200 dark:bg-vdcGrey" />
      <div className="h-40 rounded-sm bg-slate-200 dark:bg-vdcGrey" />
    </div>
  );
}
