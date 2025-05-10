import { getSeasonCached, getStandingsByCached } from "@/lib/common/cache";
import PlayerCard from "./PlayerCard";
import { getApexRankings } from "@/lib/queries/standings/standings";

export default async function TeamPanel({ team }: { team }) {
  console.log(team);
  const currentSeason = await getSeasonCached();
  const standings = await getStandingsByCached(currentSeason, team.tier);
  const [teamStandings, rank] = (() => {
    const index = standings.findIndex((s) => s.teamName === team.name);
    return [standings[index], index];
  })();

  const isApexRank =
    rank < getApexRankings(standings) && typeof rank === "number";
  return (
    <div className="p-5 xl:py-3 xl:px-0 flex flex-col gap-5">
      <div>
        <div className="flex flex-col rounded-md drop-shadow-lg">
          <div className="flex flex-col italic gap-2">
            <TeamStats
              stats={teamStandings}
              rank={rank}
              isApexRank={isApexRank}
            />
          </div>
        </div>
      </div>
      <div>
        <h1 className="italic text-md">Roster:</h1>
        <div className="grid grid-cols-1 gap-2 p-2">
          {team.Roster.map((player, id) => (
            <PlayerCard key={id} player={player} />
          ))}
        </div>
      </div>
    </div>
  );
}

function TeamStats({ stats, rank, isApexRank }: { stats; rank; isApexRank }) {
  const isRanked = rank !== -1;

  const statEntries = [
    ...(isRanked
      ? [{ label: "#: ", value: rank + 1 }]
      : [{ label: "#: ", value: "N/A" }]),
    { label: "W: ", value: stats?.wins || 0 },
    { label: "L: ", value: stats?.losses || 0 },
    { label: "RWP: ", value: `${stats?.rwp || 0}%` },
  ];

  return (
    <div className="flex bg-gray-100 dark:bg-[#353543] text-sm text-vdcGrey dark:text-gray-300 rounded-md overflow-hidden">
      {statEntries.map((entry) => {
        const isRankCell = entry.label === "#: ";
        return (
          <div
            key={entry.label}
            className="flex flex-row flex-1 items-center justify-between px-2 py-4 xl:py-5 border-x first:border-l-0 last:border-r-0 border-vdcBlack gap-2 text-xs xl:text-md my-auto text-vdcGrey dark:text-gray-300"
          >
            <h1>{entry.label}</h1>
            <h1
              className={`my-auto ${
                isRankCell && isApexRank ? "text-vdcRed font-bold" : ""
              }`}
            >
              {entry.value}
            </h1>
          </div>
        );
      })}
    </div>
  );
}
