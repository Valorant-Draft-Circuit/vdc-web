export default function TeamOverviewSkeleton() {
  return (
    <div className="flex flex-col gap-4 animate-pulse">
      <div className="grid grid-cols-2 sm:flex gap-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="flex-1 h-14 rounded-md bg-slate-100 dark:bg-vdcGrey"
          />
        ))}
      </div>
      <div className="h-64 rounded-md bg-slate-100 dark:bg-vdcGrey" />
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 h-40 rounded-md bg-slate-100 dark:bg-vdcGrey" />
        <div className="flex-1 h-40 rounded-md bg-slate-100 dark:bg-vdcGrey" />
      </div>
    </div>
  );
}
