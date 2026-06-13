export default function PlayoffBracketSkeleton() {
  const columns = [4, 2, 1];
  return (
    <div className="bg-gray-100 dark:bg-vdcGrey/30 rounded-2xl p-6 border border-black/5 dark:border-white/10 overflow-x-auto animate-pulse">
      <div className="flex w-full gap-6 min-w-[44rem]">
        {columns.map((count, columnIndex) => (
          <div
            key={columnIndex}
            className="flex-1 flex flex-col justify-around gap-6"
          >
            <div className="h-3 w-20 mx-auto bg-gray-400/40 rounded" />
            {Array(count)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="h-16 w-full max-w-[15rem] mx-auto bg-vdcWhite dark:bg-vdcGrey rounded-lg"
                />
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}
