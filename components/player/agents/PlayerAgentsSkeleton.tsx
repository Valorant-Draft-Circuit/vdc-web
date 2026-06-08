export default function PlayerAgentsSkeleton() {
  return (
    <div className="flex flex-col gap-2 px-2 xl:px-0">
      <div className="h-10 rounded-md bg-slate-100 dark:bg-vdcGrey animate-pulse" />
      <div className="h-[220px] rounded-md bg-slate-100 dark:bg-vdcGrey animate-pulse" />
      <div className="rounded-md bg-slate-100 dark:bg-vdcGrey p-4 flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-8 bg-slate-200 dark:bg-vdcBlack/40 rounded animate-pulse" />
        ))}
      </div>
    </div>
  );
}
