import FlameLogo from "@/components/theme/FlameLogo";
import { FranchiseInfo, getFranchiseBySlugCached } from "@/lib/common/cache";
import { TEAM_LOGOS_URL, TIER_COLOR_MAP } from "@/lib/common/constants";
import { toTailwindCustomHexCode } from "@/lib/common/utils";
import Image from "next/image";
const tierOrder = ["MYTHIC", "EXPERT", "APPRENTICE", "PROSPECT"];

export default async function Page({
  params,
}: {
  params: Promise<{ slug: number }>;
}) {
  const { slug } = await params;
  const res = await getFranchiseBySlugCached(String(slug));
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
  const tierList = getTeamTiers(franchiseInfo!);
  const sortedTiers = [...tierList].sort(
    (a, b) => tierOrder.indexOf(a) - tierOrder.indexOf(b)
  );

  return (
    <div className="mx-auto max-w-7xl pb-10 xl:px-8 xl:py-12">
      <div className="mx-auto xl:max-w-4xl">
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
              {sortedTiers.map((tier, i) => {
                const color = TIER_COLOR_MAP[tier];
                return (
                  <FlameLogo
                    color={color}
                    key={i}
                    className={`size-5 xl:size-8 ${color} drop-shadow-xl`}
                  />
                );
              })}
            </div>
          </div>
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

function getTeamTiers(franchise: FranchiseInfo) {
  const tiers: string[] = [];
  franchise.Teams.forEach((team) => {
    if (team.active) tiers.push(team.tier);
  });
  return tiers;
}
