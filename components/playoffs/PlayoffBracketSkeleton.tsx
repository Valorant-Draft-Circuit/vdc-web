export default function PlayoffBracketSkeleton() {
  const columns = [4, 2, 1];
  return (
    <div className="bg-vdcRed/90 rounded-2xl p-5 overflow-x-auto animate-pulse">
      <div className="flex gap-12 min-w-min">
        {columns.map((count, columnIndex) => (
          <div
            key={columnIndex}
            className="flex flex-col justify-around gap-6 min-w-[220px]"
          >
            <div className="h-3 w-20 mx-auto bg-vdcWhite/40 rounded" />
            {Array(count)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="h-16 bg-vdcWhite dark:bg-vdcGrey rounded-lg"
                />
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}
