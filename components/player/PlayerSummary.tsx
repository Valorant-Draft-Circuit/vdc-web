import { avg, sum } from "@/lib/common/utils";

export default async function PlayerSummary({ stats }: { stats }) {
  const summedStats = {
    totalKills: sum(stats.map((ps) => ps.kills)),
    totalAssists: sum(stats.map((ps) => ps.assists)),
    totalDeaths: sum(stats.map((ps) => ps.deaths)),
    firstKills: sum(stats.map((ps) => ps.firstKills)),
    firstDeaths: sum(stats.map((ps) => ps.firstDeaths)),
    totalDamage: sum(stats.map((ps) => ps.totalDamage)),
    rounds: sum(stats.map((ps) => ps.rounds)),
    avgkast: avg(stats.map((ps) => ps.kast)),
    totalPlants: sum(stats.map((ps) => ps.plants)),
    clutches: sum(stats.map((ps) => ps.clutches)),
  };
  const ratings = {
    ratingAttack: avg(stats.map((ps) => ps.ratingAttack)),
    ratingDefense: avg(stats.map((ps) => ps.ratingDefense)),
  };

  return (
    <div className="flex flex-col xl:flex-row px-7 gap-2">
      <div className="flex flex-col gap-2">
        {stats ? (
          <>
            <PlayerRating ratings={ratings} />
            <PlayerStats stats={stats} />
          </>
        ) : (
          <NoStats />
        )}
      </div>
    </div>
  );
}

function NoStats() {
  return (
    <div className="m-auto text-center py-10">
      <h1 className="text-vdcRed">
        Player has no available stats for the season!
      </h1>
    </div>
  );
}
export function PlayerRating({ ratings }: { ratings }) {
  const ratingAttack = ratings.ratingAttack || 0;
  const ratingDefense = ratings.ratingDefense || 0;
  const overallRating = (ratingAttack + ratingDefense) / 2;
  const ratingsList = [
    { name: "Overall", rating: overallRating },
    { name: "ATK", rating: ratingAttack },
    { name: "DEF", rating: ratingDefense },
  ];
  return (
    <div className="divide-y divide-gray-200 dark:divide-vdcBlack dark:bg-vdcGrey overflow-hidden rounded-lg shadow-sm">
      <div className="px-4 py-2 sm:px-6">
        <h1 className="text-sm">Rating</h1>
      </div>
      <div className="px-4 py-3 sm:p-6 grid grid-cols-3 italic text-center">
        {ratingsList.map((rating, index) => (
          <div className="flex flex-col" key={index}>
            <h1 className="text-sm">{rating.name}</h1>
            <h2 className="text-xs">{rating.rating.toFixed(2)}</h2>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PlayerStats(stats) {
  return (
    <div className="divide-y divide-gray-200 dark:divide-vdcBlack dark:bg-vdcGrey overflow-hidden rounded-lg shadow-sm">
      <div className="px-4 py-2 sm:px-6">
        <h1 className="text-sm">Stats</h1>
      </div>
      <div className="px-4 py-3 sm:p-6 grid grid-cols-2 italic text-sm">
        <h1>ACS: 420</h1>
        <h1>KD: .69</h1>
        <h1>FK: 6</h1>
        <h1>FD: 9</h1>
        <h1>KAST: 69</h1>
        <h1>HS%: 69%</h1>
      </div>
    </div>
  );
}
