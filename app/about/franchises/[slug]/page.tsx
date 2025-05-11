import TeamPanel, {
  TeamPanelSkeleton,
} from "@/components/franchises/teams/TeamPanel";
import HorizontalTab from "@/components/tabs/HorizontalTab";
import { FranchiseTeams } from "@/components/tabs/HorizontalTab";
import FlameLogo from "@/components/theme/FlameLogo";
import {
  getFranchiseDetailsBySlugCached,
  getSeasonCached,
} from "@/lib/common/cache";
import {
  TEAM_LOGOS_URL,
  TIER_COLOR_MAP,
  TIER_HEX_COLOR_MAP,
  TIER_ORDER,
} from "@/lib/common/constants";
import { toTailwindCustomHexCode } from "@/lib/common/utils";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: number }>;
}) {
  const { slug } = await params;
  const currentSeason = await getSeasonCached();
  const res = await getFranchiseDetailsBySlugCached(
    String(slug).toLocaleLowerCase(),
    currentSeason
  );

  let franchiseInfo;
  if (res) {
    franchiseInfo = res;
  }

  const primary = toTailwindCustomHexCode(franchiseInfo!.Brand!.colorPrimary);
  const secondary = toTailwindCustomHexCode(
    franchiseInfo!.Brand!.colorSecondary
  );
  const agmList = getAgms(franchiseInfo);
  const activeTeams = getActiveTeams(franchiseInfo);

  return (
    <div className="mx-auto max-w-7xl pb-10 xl:px-8 xl:py-12">
      <div className="mx-auto xl:max-w-4xl flex flex-col gap-5">
        <div
          style={{ "--p": primary, "--s": secondary } as React.CSSProperties}
          className="relative xl:col-span-5 xl:rounded-3xl px-10 py-32 overflow-hidden xl:shadow-2xl bg-gradient-to-tl from-[var(--p)] to-[var(--s)]"
        >
          <div className="absolute inset-0 bg-black/80 pointer-events-none" />
          <Image
            alt={franchiseInfo!.slug}
            src={`${TEAM_LOGOS_URL}${franchiseInfo!.Brand?.logo}`}
            width={5000}
            height={5000}
            className="absolute pointer-events-none inset-0 size-full object-contain sm:right-5 z-0 sm:object-right xl:z-10 justify-self-end brightness-70 drop-shadow-lg"
          />
          <div className="flex flex-col z-20 tracking-tight text-pretty drop-shadow-lg rounded-2xl p-3 sm:w-1/2 text-vdcWhite gap-2">
            <h1 className="text-2xl lg:text-3xl italic">
              {franchiseInfo!.slug} | {franchiseInfo!.name}
            </h1>
            <h2 className="font-roboto text-xs">
              GM:{" "}
              <FMLink
                name={franchiseInfo!.GM?.name}
                id={franchiseInfo!.GM?.Accounts[0].providerAccountId}
              />
            </h2>
            <h2 className="font-roboto flex flex-row gap-1 my-auto text-xs">
              AGMS:{" "}
              {agmList.map((agm) => (
                <FMLink key={agm.id} name={agm.name} id={agm.id} />
              ))}
            </h2>
            <div className="flex flex-row gap-3 p-1">
              {activeTeams.map((team, i) => {
                const color = TIER_HEX_COLOR_MAP[team.tier];
                return (
                  <FlameLogo
                    color={color}
                    key={i}
                    className={`size-5 xl:size-8 drop-shadow-xl`}
                  />
                );
              })}
            </div>
          </div>
        </div>
        <div className="xl:max-w-4xl flex flex-col gap-5">
          <Suspense fallback={<TeamPanelSkeleton />}>
            <HorizontalTab tabElements={activeTeams} params="team" />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

function FMLink({ name, id }: { name; id }) {
  return (
    <Link
      href={`https://discord.com/users/${id}`}
      className="hover:opacity-90 z-20"
    >
      <span className="p-1 bg-[#353543] rounded-md shadow-2xl">
        {name}
      </span>
    </Link>
  );
}

function getAgms(franchiseInfo) {
  const agmSlots = [franchiseInfo.AGM1, franchiseInfo.AGM2, franchiseInfo.AGM3];
  return agmSlots
    .filter(
      (
        agm
      ): agm is { name: string; Accounts: { providerAccountId: string }[] } =>
        Boolean(agm && agm.name)
    )
    .map((agm) => ({
      name: agm.name,
      id: agm.Accounts[0]?.providerAccountId ?? null,
    }));
}

function getActiveTeams(franchiseInfo) {
  const activeFranchiseTeams: FranchiseTeams[] = franchiseInfo.Teams.filter(
    (team) => team.active
  ).map((team) => ({
    id: team.id,
    tier: team.tier,
    color: TIER_COLOR_MAP[team.tier],
    name: team.name,
    content: <TeamPanel team={team} />,
  }));
  return [...activeFranchiseTeams].sort(
    (a, b) => TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier)
  );
}
