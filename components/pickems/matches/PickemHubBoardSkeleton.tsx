const CARDS = [0, 1, 2, 3, 4, 5, 6, 7, 8];
const ROWS = [0, 1, 2];

export default function PickemHubBoardSkeleton() {
  return (
    <div className="grid animate-pulse grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {CARDS.map((card) => (
        <div
          key={card}
          className="flex flex-col rounded-2xl border border-black/10 bg-gray-100 p-4 dark:border-white/10 dark:bg-vdcGrey"
        >
          <div className="mb-2.5 flex items-start justify-between gap-2">
            <div className="flex flex-col gap-1.5">
              <div className="h-3.5 w-24 rounded bg-gray-300/60 dark:bg-gray-600/60" />
              <div className="h-2.5 w-16 rounded bg-gray-300/40 dark:bg-gray-600/40" />
            </div>
            <div className="h-2.5 w-12 rounded bg-gray-300/40 dark:bg-gray-600/40" />
          </div>
          <div className="flex flex-col gap-2.5">
            {ROWS.map((row) => (
              <div
                key={row}
                className="grid grid-cols-[1fr_auto_1fr] items-center gap-2.5"
              >
                <div className="ml-auto size-9 rounded-full bg-gray-300/60 dark:bg-gray-600/60" />
                <div className="flex gap-1">
                  <div className="h-8 w-[46px] rounded-md bg-gray-300/60 dark:bg-gray-600/60" />
                  <div className="h-8 w-[46px] rounded-md bg-gray-300/60 dark:bg-gray-600/60" />
                  <div className="h-8 w-[46px] rounded-md bg-gray-300/60 dark:bg-gray-600/60" />
                </div>
                <div className="size-9 rounded-full bg-gray-300/60 dark:bg-gray-600/60" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
