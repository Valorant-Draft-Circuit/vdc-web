type StatChip = [label: string, value: string];

export default function StatChips({
  stats,
  className = "grid grid-cols-2 sm:grid-cols-4 gap-2",
}: {
  stats: StatChip[];
  className?: string;
}) {
  return (
    <div className={className}>
      {stats.map(([label, value]) => (
        <div
          key={label}
          className="flex flex-col items-center rounded bg-vdcWhite/55 dark:bg-vdcBlack/55 backdrop-blur-sm px-2 py-1"
        >
          <h1 className="text-[10px] text-vdcRed font-semibold">{label}</h1>
          <h2 className="text-sm text-vdcBlack dark:text-vdcWhite">{value}</h2>
        </div>
      ))}
    </div>
  );
}
