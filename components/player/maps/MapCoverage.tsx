import Image from "next/image";
import {
  overallRating,
  ratingBucket,
  winPercent,
  winRateBucket,
  type MapRow,
} from "@/lib/common/maps";

type Props = {
  rows: MapRow[];
  isCombine: boolean;
};

const BUCKET_BAR: Record<ReturnType<typeof winRateBucket>, string> = {
  high: "bg-vdcGreen",
  mid: "bg-vdcOrange",
  low: "bg-vdcRed",
};

export default function MapCoverage({ rows, isCombine }: Props) {
  if (rows.length === 0) return null;

  const orderedRows = isCombine
    ? [...rows].sort((a, b) => overallRating(b) - overallRating(a))
    : rows;

  return (
    <div className="mx-2 xl:mx-0">
      <h1 className="text-ms uppercase tracking-wide text-vdcRed mb-2">
        Coverage
      </h1>
      <div className="grid grid-cols-3 sm:grid-cols-4 xl:grid-cols-6 gap-2">
        {orderedRows.map((row) => {
          const rating = overallRating(row);
          const winPct = winPercent(row);
          const headline = isCombine
            ? rating.toFixed(2)
            : `${winPct.toFixed(0)}%`;
          const barClass = isCombine
            ? BUCKET_BAR[ratingBucket(rating)]
            : BUCKET_BAR[winRateBucket(winPct)];
          return (
            <div
              key={row.map}
              className="relative aspect-[4/3] rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600"
            >
              {row.splashUrl && (
                <Image
                  src={row.splashUrl}
                  alt={row.map}
                  fill
                  sizes="(max-width: 640px) 33vw, (max-width: 1280px) 25vw, 16vw"
                  className="object-cover"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-black/5 to-black/60 dark:from-black/25 dark:to-black/85" />
              <div className="absolute inset-0 p-2 flex flex-col justify-between">
                <h4 className="text-xs font-bold text-white drop-shadow">
                  {row.map}
                </h4>
                <div>
                  <h4 className="text-lg font-extrabold text-white drop-shadow leading-none">
                    {headline}
                  </h4>
                  <h2 className="text-[10px] text-gray-200">
                    {`${row.gamesPlayed} games`}
                  </h2>
                </div>
              </div>
              <div
                className={`absolute left-0 right-0 bottom-0 h-1 ${barClass}`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
