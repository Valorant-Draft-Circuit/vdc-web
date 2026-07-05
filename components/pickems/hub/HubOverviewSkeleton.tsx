export default function HubOverviewSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-4">
      <div className="h-24 rounded-md bg-slate-100 dark:bg-vdcGrey" />
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="h-32 flex-1 rounded-md bg-slate-100 dark:bg-vdcGrey" />
        <div className="h-32 flex-1 rounded-md bg-slate-100 dark:bg-vdcGrey" />
        <div className="h-32 flex-1 rounded-md bg-slate-100 dark:bg-vdcGrey" />
      </div>
      <div className="h-80 rounded-md bg-slate-100 dark:bg-vdcGrey" />
    </div>
  );
}
