import { avg } from "@/lib/common/math";
import { ProcessedPlayerStat } from "./PlayerSummary";

export default function PlayerRating({
  stats,
}: {
  stats: ProcessedPlayerStat[];
}) {
  const ratings = {
    ratingAttack: avg(stats.map((ps) => ps.ratingAttack)),
    ratingDefense: avg(stats.map((ps) => ps.ratingDefense)),
  };
  const ratingAttack = ratings.ratingAttack || 0;
  const ratingDefense = ratings.ratingDefense || 0;
  const overallRating = (ratingAttack + ratingDefense) / 2;
  const ratingsList = [
    { name: "Overall", rating: overallRating },
    { name: "ATK", rating: ratingAttack },
    { name: "DEF", rating: ratingDefense },
  ];

  return (
    <div className="divide-y divide-gray-600 dark:divide-vdcBlack bg-slate-100 dark:bg-vdcGrey overflow-hidden rounded-sm shadow-sm">
      <div className="px-4 py-2 xl:px-6">
        <h1 className="text-sm italic">Rating</h1>
      </div>
      <div className="px-4 py-3 sm:p-6 grid grid-cols-3 text-center">
        {ratingsList.map((rating, index) => (
          <div className="flex flex-col" key={index}>
            <h1 className="text-sm text-vdcRed">{rating.name}</h1>
            <h2 className="text-gray-700 dark:text-gray-200 text-sm">
              {rating.rating.toFixed(2)}
            </h2>
          </div>
        ))}
      </div>
    </div>
  );
}
