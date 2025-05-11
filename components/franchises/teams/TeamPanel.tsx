import { getSeasonCached, getStandingsByCached } from "@/lib/common/cache";
import { getApexRankings } from "@/lib/queries/standings/standings";
import PlayerCard from "./PlayerCard";
import MatchCard from "@/components/schedule/MatchCard";
import Divider from "@/components/theme/Divider";

export default async function TeamPanel({ team }: { team }) {
  const season = await getSeasonCached();
  const standings = await getStandingsByCached(season, team.tier);
  const idx = standings.findIndex((s) => s.teamName === team.name);
  const [teamStats, rank] = [standings[idx], idx];

  const isApexRank =
    typeof rank === "number" && rank < getApexRankings(standings);
  const { futureGames, pastGames, Roster } = team;

  return (
    <div className="p-5 xl:py-3 xl:px-0 flex flex-col gap-5">
      <div className="rounded-md drop-shadow-lg">
        <TeamStats stats={teamStats} rank={rank} isApexRank={isApexRank} />
      </div>

      <div className="flex flex-col sm:flex-row gap-2 text-md">
        <PanelSection title="Roster">
          <div className="grid grid-cols-1 gap-2 xl:p-2 mx-auto">
            {Roster.length > 0 ? (
              <>
                {Roster.map((player, i: number) => (
                  <PlayerCard key={player.id ?? i} player={player} />
                ))}
              </>
            ) : (
              <EmptyMessage text={"There's no one here :("} />
            )}
          </div>
        </PanelSection>
        <div className="flex-1 flex-col">
          <PanelSection title="Team Stats">
            <EmptyMessage text={"TODO: Stats Table go here "} />
          </PanelSection>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <MatchSection
          title="Match History"
          matches={pastGames}
          emptyText="No games played yet"
        />
        <MatchSection
          title="Upcoming Games"
          matches={futureGames}
          emptyText="No games scheduled"
        />
      </div>
    </div>
  );
}

function PanelSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col">
      <Divider title={title} />
      {children}
    </div>
  );
}

function MatchSection({
  title,
  matches,
  emptyText,
}: {
  title;
  matches;
  emptyText;
}) {
  return (
    <PanelSection title={title}>
      {matches.length > 0 ? (
        <div className="grid grid-cols-1 gap-2 p-2">
          {matches.map((match, index) => (
            <div key={index}>
              <div className="pb-2 italic text-vdcGrey dark:text-gray-300 text-sm xl:text-md">
                <h1>{match.date}</h1>
              </div>
              <MatchCard match={match} />
            </div>
          ))}
        </div>
      ) : (
        <EmptyMessage text={emptyText} />
      )}
    </PanelSection>
  );
}

function EmptyMessage({ text }: { text: string }) {
  return (
    <div className="text-center my-auto text-sm text-vdcRed">
      <div className="px-4 py-5 sm:p-6">
        <h1>{text}</h1>
      </div>
    </div>
  );
}

function TeamStats({ stats, rank, isApexRank }: { stats; rank; isApexRank }) {
  const entries = [
    { label: "RANK: ", value: rank >= 0 ? rank + 1 : "N/A" },
    { label: "W: ", value: stats?.wins || 0 },
    { label: "L: ", value: stats?.losses || 0 },
    { label: "RWP: ", value: `${stats?.rwp || 0}%` },
  ];

  return (
    <div className="flex bg-gray-100 dark:bg-[#353543] text-sm text-vdcGrey dark:text-gray-300 rounded-md overflow-hidden">
      {entries.map((e) => {
        const isRank = e.label === "RANK: ";
        return (
          <div
            key={e.label}
            className="flex flex-1 items-center justify-between px-2 py-4 xl:py-5 border-x border-vdcBlack first:border-l-0 last:border-r-0 gap-2 text-xs xl:text-md"
          >
            <h1>{e.label}</h1>
            <h1 className={isRank && isApexRank ? "text-vdcRed font-bold" : ""}>
              {e.value}
            </h1>
          </div>
        );
      })}
    </div>
  );
}

export function TeamPanelSkeleton() {
  return (
    <div className="p-5 xl:py-3 xl:px-0 flex flex-col gap-5 animate-pulse">
      <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-md drop-shadow-lg" />
      <div className="flex flex-col sm:flex-row gap-2 text-md">
        <div className="flex-1 flex flex-col">
          <Divider title="Roster" />
          <div className="grid grid-cols-1 gap-2 xl:p-2 mx-auto">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="h-16 bg-gray-200 dark:bg-gray-700 rounded-md w-full"
                />
              ))}
          </div>
        </div>
        <div className="flex-1 flex flex-col">
          <Divider title="Team Stats" />
          <div className="px-4 py-5 sm:p-6 w-full space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {["Match History", "Upcoming Games"].map((section) => (
          <div key={section} className="flex flex-col">
            <Divider title={section} />
            <div className="grid grid-cols-1 gap-2 p-2">
              {Array(3)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="flex items-center gap-4 w-full">
                    <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="flex-1 h-16 bg-gray-200 dark:bg-gray-700 rounded-md" />
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
