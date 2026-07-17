import { getSeasonCached, getStandingsByCached } from "@/lib/common/cache";
import { TIER_HEX_COLOR_MAP } from "@/lib/common/constants/tiers";
import { buildRosterStatRows } from "@/lib/common/team";
import {
  calculateTeamTotalMmr,
  FranchiseTeam,
} from "@/lib/queries/franchises/franchises";
import { getApexRankings } from "@/lib/queries/standings/standings";
import { FormattedStat, getStatsBy } from "@/lib/queries/stats/stats";
import { ControlPanel } from "@/prisma";
import RosterStatsTable from "./RosterStatsTable";
import TeamMatchList from "./TeamMatchList";

export default async function TeamOverview({ team }: { team: FranchiseTeam }) {
  const season = await getSeasonCached();
  const [standings, mmrShow, teamStats] = await Promise.all([
    getStandingsByCached(season, team.tier),
    ControlPanel.getMMRDisplayState(),
    getStatsBy({ teamId: team.id, season: season }),
  ]);

  const rankIndex = standings.findIndex((s) => s.teamName === team.name);
  const standing = rankIndex >= 0 ? standings[rankIndex] : undefined;
  const isApexRank = rankIndex >= 0 && rankIndex < getApexRankings(standings);
  const rows = buildRosterStatRows(team.Roster, teamStats as FormattedStat[]);

  const chips = [
    {
      label: "Rank",
      value: rankIndex >= 0 ? `#${rankIndex + 1}` : "N/A",
      highlight: isApexRank,
    },
    {
      label: "Record",
      value: `${standing?.wins ?? 0} - ${standing?.losses ?? 0}`,
      highlight: false,
    },
    {
      label: "RWP",
      value: `${((standing?.rwp ?? 0) * 100).toFixed(0)}%`,
      highlight: false,
    },
    ...(mmrShow
      ? [
          {
            label: "MMR",
            value: String(calculateTeamTotalMmr(team.Roster)),
            highlight: false,
          },
        ]
      : []),
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 sm:flex gap-2">
        {chips.map((chip) => (
          <div
            key={chip.label}
            className="flex-1 rounded-md bg-slate-100 dark:bg-vdcGrey px-3 py-2 border-l-2"
            style={{ borderLeftColor: TIER_HEX_COLOR_MAP[team.tier] }}
          >
            <h2 className="text-sm tracking-wider uppercase font-semibold text-vdcRed">
              {chip.label}
            </h2>
            <h2
              className={`text-lg font-bold tabular-nums ${chip.highlight ? "text-vdcRed" : ""}`}
            >
              {chip.value}
            </h2>
          </div>
        ))}
      </div>
      <RosterStatsTable rows={rows} mmrShow={mmrShow} />
      <div className="flex flex-col sm:flex-row gap-4">
        <TeamMatchList
          title="Upcoming"
          matches={team.futureGames}
          teamId={team.id}
          tier={team.tier}
          variant="upcoming"
          emptyText="No matches scheduled"
        />
        <TeamMatchList
          title="Recent Results"
          matches={team.pastGames}
          teamId={team.id}
          tier={team.tier}
          variant="results"
          emptyText="No matches played yet"
        />
      </div>
    </div>
  );
}
