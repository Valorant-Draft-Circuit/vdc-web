export function PlayerSummarySkeleton() {
  return (
    <div className="flex flex-col xl:flex-row px-2 xl:px-0 gap-2">
      <div className="flex flex-col gap-2 xl:w-1/2">
        <SkeletonCard headerWidth="w-1/3" bodyHeightClass="h-12" bodyCols={3} />
        <SkeletonCard headerWidth="w-1/3" bodyHeightClass="h-20" bodyCols={3} />
        <SkeletonCard headerWidth="w-1/4" bodyHeightClass="h-10" bodyCols={1} />
        <SkeletonCard headerWidth="w-1/4" bodyHeightClass="h-20" bodyCols={1} />
        <SkeletonCard headerWidth="w-1/3" bodyHeightClass="h-24" bodyCols={1} />
      </div>
    </div>
  );
}

function SkeletonCard({
  headerWidth,
  bodyHeightClass,
  bodyCols,
}: {
  headerWidth: string;
  bodyHeightClass: string;
  bodyCols: number;
}) {
  return (
    <div className="divide-y divide-gray-200 dark:divide-vdcBlack dark:bg-vdcCard overflow-hidden rounded-sm shadow-sm">
      <div className="px-4 py-2 sm:px-6 animate-pulse">
        <div
          className={`h-4 bg-gray-200 dark:bg-gray-700 rounded ${headerWidth}`}
        />
      </div>
      <div
        className="px-4 py-3 sm:p-6 text-center gap-2 animate-pulse"
        style={{ display: "grid", gridTemplateColumns: `repeat(${bodyCols}, 1fr)` }}
      >
        {Array.from({ length: bodyCols }).map((_, i) => (
          <div className="flex flex-col" key={i}>
            <div className={`${bodyHeightClass} bg-gray-200 dark:bg-gray-700 rounded`} />
          </div>
        ))}
      </div>
    </div>
  );
}
