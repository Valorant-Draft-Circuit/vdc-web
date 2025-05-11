export default function StandingsPanelSkeleton({
  count = 6,
}: {
  count?: number;
}) {
  return (
    <div className="flex flex-col gap-3 bg-vdcRed p-5 rounded-2xl animate-pulse">
      {Array(count)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            className="flex flex-row gap-10 rounded-2xl bg-vdcWhite dark:bg-vdcGrey py-4 px-5 xl:px-24 drop-shadow-lg"
          >
            <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-full drop-shadow-md" />
            <div className="flex flex-col flex-1 space-y-2">
              <div className="h-4 w-1/3 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-4 w-1/4 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-4 w-1/5 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
        ))}
    </div>
  );
}
