export function PlayerSummarySkeleton() {
  return (
    <div className="flex flex-col xl:flex-row px-2 xl:px-0 gap-2">
      <div className="flex flex-col gap-2 xl:w-1/3">
        <div className="divide-y divide-gray-200 dark:divide-vdcBlack dark:bg-vdcGrey overflow-hidden rounded-lg shadow-sm ">
          <div className="px-4 py-2 sm:px-6 animate-pulse ">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          </div>
          <div className="px-4 py-3 sm:p-6 grid grid-cols-3 italic text-center gap-2 animate-pulse">
            {Array.from({ length: 3 }).map((_, i) => (
              <div className="flex flex-col" key={i}>
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded " />
              </div>
            ))}
          </div>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-vdcBlack dark:bg-vdcGrey overflow-hidden rounded-lg shadow-sm ">
          <div className="px-4 py-2 sm:px-6 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          </div>
          <div className="px-4 py-3 sm:p-6 grid grid-cols-3 italic text-center gap-2 animate-pulse">
            {Array.from({ length: 3 }).map((_, i) => (
              <div className="flex flex-col" key={i}>
                <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded " />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
