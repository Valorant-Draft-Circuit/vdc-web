import TeamPanel, {
  TeamPanelSkeleton,
} from "@/components/franchises/teams/TeamPanel";
import HorizontalTab from "@/components/tabs/HorizontalTab";
import { TTabElements } from "@/components/tabs/HorizontalTab";
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
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import type { Metadata } from "next";
import { getUserTier } from "@/lib/queries/user/user";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `VDC | ${slug}`,
    description: `${slug} information`,
  };
}

export default async function Page({ params, searchParams }: Props) {
  const [{ slug }, sp, currentSeason, userTier] = await Promise.all([
    params,
    searchParams,
    getSeasonCached(),
    getUserTier(),
  ]);

  const res = await getFranchiseDetailsBySlugCached(
    String(slug).toLocaleLowerCase(),
    currentSeason,
  );
  if (!res) notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const franchiseInfo: any = res;

  const primary = toTailwindCustomHexCode(franchiseInfo!.Brand!.colorPrimary);
  const secondary = toTailwindCustomHexCode(
    franchiseInfo!.Brand!.colorSecondary,
  );
  const agmList = getAgms(franchiseInfo);
  const activeTeams = getActiveTeams(franchiseInfo);

  let defaultQuery = "";
  if (userTier) {
    const franchiseHasTier = await franchiseContainsTier(
      franchiseInfo.id,
      userTier,
    );
    defaultQuery = franchiseHasTier ? userTier : "";
  }

  if (activeTeams.length > 0) {
    const validTeams = new Set(activeTeams.map((t) => t.query.toLowerCase()));
    const teamOk = typeof sp.team === "string" && validTeams.has(sp.team);
    if (!teamOk) {
      const defaultTeam = (defaultQuery || activeTeams[0].query).toLowerCase();
      redirect(`/franchises/${slug}?team=${defaultTeam}`);
    }
  }

  return (
    <div className="mx-auto max-w-400 pb-10 xl:px-8 xl:py-12">
      <div className="mx-auto xl:max-w-5xl flex flex-col gap-5">
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
                const color = TIER_HEX_COLOR_MAP[team.query];
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
        <div className="xl:max-w-5xl flex flex-col gap-5">
          {activeTeams.length === 0 ? (
            <div className="text-center italic text-vdcGrey dark:text-vdcWhite py-10">
              No active teams for this franchise.
            </div>
          ) : (
            <Suspense fallback={<TeamPanelSkeleton />}>
              <HorizontalTab
                tabElements={activeTeams}
                params="team"
                defaultQuery={defaultQuery}
              />
            </Suspense>
          )}
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
      <span className="p-1 bg-[#353543] rounded-md shadow-2xl">{name}</span>
    </Link>
  );
}

function getAgms(franchiseInfo) {
  const agmSlots = [franchiseInfo.AGM1, franchiseInfo.AGM2, franchiseInfo.AGM3];
  return agmSlots
    .filter(
      (
        agm,
      ): agm is { name: string; Accounts: { providerAccountId: string }[] } =>
        Boolean(agm && agm.name),
    )
    .map((agm) => ({
      name: agm.name,
      id: agm.Accounts[0]?.providerAccountId ?? null,
    }));
}

function getActiveTeams(franchiseInfo) {
  const activeFranchiseTeams: TTabElements[] = franchiseInfo.Teams.filter(
    (team) => team.active,
  ).map((team) => ({
    id: team.id,
    query: team.tier,
    color: TIER_COLOR_MAP[team.tier],
    name: team.name,
    content: <TeamPanel team={team} />,
  }));
  return [...activeFranchiseTeams].sort(
    (a, b) => TIER_ORDER.indexOf(a.query) - TIER_ORDER.indexOf(b.query),
  );
}

async function franchiseContainsTier(franchise, tier) {
  const res = await prisma.teams.findFirst({
    where: {
      franchise: franchise,
      tier: tier,
    },
    select: {
      id: true,
    },
  });
  return !!res;
}
