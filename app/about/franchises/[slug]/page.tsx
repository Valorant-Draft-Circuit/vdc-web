import { getFranchiseBySlugCached } from "@/lib/common/cache";
import { TEAM_LOGOS_URL } from "@/lib/common/constants";
import { toTailwindCustomHexCode } from "@/lib/common/utils";
import Image from "next/image";

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
  const primary = toTailwindCustomHexCode(franchiseInfo.Brand.colorPrimary);
  const secondary = toTailwindCustomHexCode(franchiseInfo.Brand.colorSecondary);
  const agms: string[] = [
    franchiseInfo.AGM1?.name,
    franchiseInfo.AGM2?.name,
    franchiseInfo.AGM3?.name,
  ].filter((name): name is string => typeof name === "string");
  const agmList = agmListBuilder(agms);

  return (
    <div className="mx-auto max-w-7xl pb-10 xl:px-8 xl:py-12">
      <div className="mx-auto xl:max-w-4xl">
        <div
          style={{ "--p": primary, "--s": secondary } as React.CSSProperties}
          className="relative xl:col-span-5 xl:rounded-3xl px-10 py-32 overflow-hidden xl:shadow-2xl bg-gradient-to-tl from-[var(--p)] to-[var(--s)] "
        >
          <Image
            alt={franchiseInfo.slug}
            src={`${TEAM_LOGOS_URL}${franchiseInfo.Brand.logo}`}
            width={5000}
            height={5000}
            className="absolute inset-0 size-full object-contain sm:right-0 z-0 sm:object-right justify-self-end brightness-70"
          />
          <div className="flex flex-col tracking-tight text-pretty drop-shadow-2xl bg-vdcBlack rounded-2xl p-3 sm:w-1/2 text-vdcWhite gap-2 z-20">
            {/* <h1 className="text-xl">{franchiseInfo?.slug}</h1> */}
            <h1 className="text-2xl lg:text-3xl italic">
              {franchiseInfo?.slug} | {franchiseInfo.name}
            </h1>
            <h2 className="font-roboto">GM: {franchiseInfo.GM.name}</h2>
            <h2 className="font-roboto">AGMS: {agmList}</h2>
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
