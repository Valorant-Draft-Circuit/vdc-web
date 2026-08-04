export default function AggregateStatCard({
  label,
  headline,
  detail,
}: {
  label: string;
  headline: string;
  detail?: string;
}) {
  return (
    <div className="flex-1 rounded-md border border-black/5 bg-vdcWhite/40 p-3 backdrop-blur-sm dark:border-white/10 dark:bg-vdcBlack/40">
      <h2 className="text-[10px] font-bold uppercase tracking-wide text-vdcGrey dark:text-gray-400">
        {label}
      </h2>
      <h2 className="mt-1 text-sm font-bold">{headline}</h2>
      {detail ? (
        <h2 className="mt-0.5 text-xs text-vdcGrey dark:text-gray-400">{detail}</h2>
      ) : null}
    </div>
  );
}
