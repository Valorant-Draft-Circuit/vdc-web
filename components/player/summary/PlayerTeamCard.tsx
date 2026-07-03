import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getStandingsByTier } from "@/lib/queries/standings/standings";
import { TEAM_LOGOS_URL } from "@/lib/common/constants/urls";
import { Tier } from "@prisma/client";

type Props = {
  teamId: number;
  season: number;
};

export default async function PlayerTeamCard({ teamId, season }: Props) {
  const team = await prisma.teams.findUnique({
    where: { id: teamId },
    include: { Franchise: { include: { Brand: true } } },
  });
  if (!team) return null;

  const standings = await getStandingsByTier(season, team.tier as Tier);
  const franchiseSlug = team.Franchise?.slug;
  const standingIndex = standings.findIndex(
    (row) => row.franchiseSlug === franchiseSlug,
  );
  const teamRow = standingIndex !== -1 ? standings[standingIndex] : null;

  const teamRank = standingIndex !== -1 ? standingIndex + 1 : null;
  const totalTeams = standings.length;
  const wins = teamRow?.wins ?? 0;
  const losses = teamRow?.losses ?? 0;

  const logoPath = team.Franchise?.Brand?.logo;
  const tierSlug = team.tier.toLowerCase();
  const franchiseHref = franchiseSlug
    ? `/franchises/${franchiseSlug}?team=${tierSlug}`
    : null;

  return (
    <div className="divide-y divide-gray-600 dark:divide-vdcBlack bg-slate-100 dark:bg-vdcGrey overflow-hidden rounded-sm shadow-sm">
      <div className="px-4 py-2 xl:px-6">
        <h1 className="text-sm">Team</h1>
      </div>
      <div className="px-4 py-3 sm:px-6">
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 w-full">
          <TeamLogo
            logoPath={logoPath}
            franchiseHref={franchiseHref}
            teamId={teamId}
          />
          <div className="flex flex-col min-w-0">
            <h1 className="text-sm text-wrap">{team.name}</h1>
            <h2 className="text-xs text-gray-500 dark:text-gray-400 flex flex-row flex-wrap items-center gap-2">
              {team.tier}
              {teamRank !== null && (
                <span className="text-vdcRed not-italic font-bold text-[10px] tracking-wide px-2 py-0.5 rounded-full bg-vdcRed/15">
                  #{teamRank} of {totalTeams}
                </span>
              )}
            </h2>
          </div>
          <div className="text-lg flex flex-row items-center gap-1 tabular-nums justify-self-end">
            <h2 className="text-vdcGreen">{wins}</h2>
            <h2 className="text-gray-400">-</h2>
            <h2 className="text-vdcRed">{losses}</h2>
          </div>
        </div>
      </div>
    </div>
  );
}

function TeamLogo({
  logoPath,
  franchiseHref,
  teamId,
}: {
  logoPath: string | null | undefined;
  franchiseHref: string | null;
  teamId: number;
}) {
  const src = logoPath ? `${TEAM_LOGOS_URL}${logoPath}` : "/vdc-flame.svg";
  const image = (
    <Image
      src={src}
      alt={String(teamId)}
      fill
      sizes="40px"
      className="rounded-md object-contain"
    />
  );
  if (!franchiseHref) {
    return <div className="relative block size-10 shrink-0">{image}</div>;
  }
  return (
    <Link href={franchiseHref} className="relative block size-10 shrink-0">
      {image}
    </Link>
  );
}
