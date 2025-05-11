export default function SchedulePanelSkeleton({
  days = 2,
  matchesPerDay = 4,
}: {
  days?: number;
  matchesPerDay?: number;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl animate-pulse px-1 xl:px-52 ">
      <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
      {Array(days)
        .fill(0)
        .map((_, i) => (
          <ScheduleCardSkeleton key={i} matches={matchesPerDay} />
        ))}
    </div>
  );
}

function MatchCardSkeleton() {
  return (
    <div className="flex flex-row h-24 gap-4 w-full items-center m-auto justify-evenly bg-vdcWhite dark:bg-vdcBlack xl:px-24 rounded-2xl">
      <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
      <div className="h-10 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
    </div>
  );
}

function ScheduleCardSkeleton({ matches }: { matches?: number }) {
  return (
    <div className="overflow-hidden rounded-lg shadow-sm bg-vdcRed p-3 animate-pulse">
      <div className="h-8 w-full bg-gray-200 dark:bg-gray-700 rounded mb-2" />
      <div className="flex flex-col gap-2">
        {Array(matches)
          .fill(0)
          .map((_, i) => (
            <MatchCardSkeleton key={i} />
          ))}
      </div>
    </div>
  );
}
