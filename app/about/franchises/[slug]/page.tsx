import TeamPanel from "@/components/franchises/teams/TeamPanel";
import VerticalTab from "@/components/tabs/VerticalTab";
import { FranchiseTeams } from "@/components/tabs/VerticalTab";
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
import { Suspense } from "react";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: number }>;
}) {
  const { slug } = await params;
  const currentSeason = await getSeasonCached();
  const res = await getFranchiseDetailsBySlugCached(
    String(slug),
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
  const agms: string[] = [
    franchiseInfo!.AGM1?.name,
    franchiseInfo!.AGM2?.name,
    franchiseInfo!.AGM3?.name,
  ].filter((name): name is string => typeof name === "string");
  const agmList = agmListBuilder(agms);

  let activeFranchiseTeams: FranchiseTeams[] = franchiseInfo.Teams.filter(
    (team) => team.active
  ).map((team) => ({
    id: team.id,
    tier: team.tier,
    color: TIER_COLOR_MAP[team.tier],
    name: team.name,
    content: <TeamPanel team={team} />,
  }));
  activeFranchiseTeams = [...activeFranchiseTeams].sort(
    (a, b) => TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier)
  );

  return (
    <div className="mx-auto max-w-7xl pb-10 xl:px-8 xl:py-12">
      <div className="mx-auto xl:max-w-4xl flex flex-col gap-5">
        <div
          style={{ "--p": primary, "--s": secondary } as React.CSSProperties}
          className="relative xl:col-span-5 xl:rounded-3xl px-10 py-32 overflow-hidden xl:shadow-2xl bg-gradient-to-tl from-[var(--p)] to-[var(--s)] -z-20 "
        >
          <div className="absolute inset-0 bg-black/60 pointer-events-none transition-opacity duration-800" />
          <Image
            alt={franchiseInfo!.slug}
            src={`${TEAM_LOGOS_URL}${franchiseInfo!.Brand?.logo}`}
            width={5000}
            height={5000}
            className="absolute inset-0 size-full object-contain sm:right-5 -z-10 sm:object-right xl:z-10 justify-self-end brightness-90 drop-shadow-lg"
          />
          <div className="flex flex-col tracking-tight text-pretty drop-shadow-xl rounded-2xl p-3 sm:w-1/2 text-vdcWhite gap-2 z-20">
            <h1 className="text-2xl lg:text-3xl italic">
              {franchiseInfo!.slug} | {franchiseInfo!.name}
            </h1>
            <h2 className="font-roboto">GM: {franchiseInfo!.GM?.name}</h2>
            <h2 className="font-roboto">AGMS: {agmList}</h2>
            <div className="flex flex-row gap-3 p-1">
              {activeFranchiseTeams.map((team, i) => {
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
          <Suspense fallback={<div>Loading teams...</div>}>
            <VerticalTab tabElements={activeFranchiseTeams} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

function agmListBuilder(agms: string[]) {
  let list = "";
  agms.forEach((agm, i) => {
    if (i !== agms.length - 1) {
      list = list + agm + ", ";
    } else {
      list = list + agm;
    }
  });
  return list;
}
