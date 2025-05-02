export default function NewsSkeleton() {
  return (
    <div className="xl:w-full animate-pulse">
      <div className="shrink-0">
        <div className="w-full h-[180px] bg-gray-300 dark:bg-gray-700 rounded-t-lg"></div>
      </div>
      <div className="bg-gray-200 dark:bg-vdcGrey p-4 xl:h-36 xl:w-full rounded-b-lg my-auto space-y-2">
        <div className="h-3 w-24 bg-gray-400 dark:bg-gray-600 rounded"></div>
        <div className="h-4 w-3/4 bg-gray-300 dark:bg-gray-500 rounded"></div>
        <div className="h-4 w-2/3 bg-gray-300 dark:bg-gray-500 rounded"></div>
      </div>
    </div>
  );
}
