import Image from "next/image";
import Link from "next/link";
import { Tier } from "@prisma/client";
import { ControlPanel } from "@/prisma";
import { summarizeFreeAgentSeason } from "@/lib/common/player";
import { getTeamLogoMap } from "@/lib/queries/teams/teams";
import { TEAM_LOGOS_URL, TIER_COLOR_MAP } from "@/lib/common/constants";

type FreeAgentStat = {
  team: number | null;
  agent: string;
  ratingAttack: number | null;
  ratingDefense: number | null;
  acs: number | null;
  kast: number | null;
  kills: number | null;
  deaths: number | null;
  assists: number | null;
  damage: number | null;
  Game: { tier: Tier; datePlayed: Date; winner: number | null; rounds: number };
};

type Props = {
  stats: FreeAgentStat[];
  mmr: number | null;
};

export default async function FreeAgentCard({ stats, mmr }: Props) {
  const summary = summarizeFreeAgentSeason(stats);
  if (summary.gamesPlayed === 0) return null;

  const [teamMap, mmrVisible] = await Promise.all([
    getTeamLogoMap(summary.teamIds),
    ControlPanel.getMMRDisplayState(),
  ]);

  const showMmr = mmrVisible && mmr !== null;

  return (
    <div className="divide-y divide-gray-600 dark:divide-vdcBlack bg-slate-100 dark:bg-vdcGrey overflow-hidden rounded-sm shadow-sm">
      <div className="px-4 py-2 xl:px-6 flex flex-row items-center gap-2">
        <h1 className="text-sm italic">Free Agent</h1>
      </div>

      <div className="px-4 py-3 sm:px-6 flex flex-col gap-3">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatTile label="Games">{summary.gamesPlayed}</StatTile>
          <StatTile label="Record">
            <span className="text-vdcGreen">{summary.wins}</span>
            <span className="text-gray-400"> - </span>
            <span className="text-vdcRed">{summary.losses}</span>
          </StatTile>
          <StatTile label="Recent">
            {formatLastPlayed(summary.lastPlayed)}
          </StatTile>
          {showMmr && <StatTile label="MMR">{Math.round(mmr ?? 0)}</StatTile>}
        </div>

        <div className="flex flex-col gap-1">
          <h2 className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Played for
          </h2>
          <TeamLogos teamIds={summary.teamIds} teamMap={teamMap} />
        </div>

        <div className="flex flex-col gap-1">
          <h2 className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Tiers played
          </h2>
          <div className="flex flex-row flex-wrap gap-2">
            {summary.tiers.map((tier) => (
              <h1
                key={tier}
                className={`text-xs font-semibold text-${TIER_COLOR_MAP[tier]}`}
              >
                {tier}
              </h1>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatTile({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col">
      <h2 className="text-[10px] uppercase tracking-wider leading-3 h-6 text-gray-500 dark:text-gray-400">
        {label}
      </h2>
      <h2 className="text-base tabular-nums">{children}</h2>
    </div>
  );
}

function TeamLogos({
  teamIds,
  teamMap,
}: {
  teamIds: number[];
  teamMap: Awaited<ReturnType<typeof getTeamLogoMap>>;
}) {
  return (
    <div className="flex flex-row flex-wrap items-center gap-2">
      {teamIds.map((teamId) => {
        const info = teamMap[teamId];
        const src = info?.logoPath
          ? `${TEAM_LOGOS_URL}${info.logoPath}`
          : "/vdc-flame.svg";
        const logo = (
          <Image
            src={src}
            alt={String(teamId)}
            fill
            sizes="32px"
            className="rounded-md object-contain"
          />
        );
        if (info?.slug) {
          return (
            <Link
              key={teamId}
              href={`/franchises/${info.slug}?team=${info.tier.toLowerCase()}`}
              className="relative block size-8 shrink-0 hover:brightness-90"
            >
              {logo}
            </Link>
          );
        }
        return (
          <div key={teamId} className="relative block size-8 shrink-0">
            {logo}
          </div>
        );
      })}
    </div>
  );
}

function formatLastPlayed(date: Date | null): string {
  if (!date) return "-";
  const daysAgo = Math.floor((Date.now() - date.getTime()) / 86_400_000);
  if (daysAgo <= 0) return "Today";
  if (daysAgo === 1) return "Yesterday";
  if (daysAgo < 7) return `${daysAgo}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
