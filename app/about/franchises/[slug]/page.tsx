import { getFranchiseBySlugCached } from "@/lib/common/cache";
import { TEAM_LOGOS_URL } from "@/lib/common/constants";
import { toHexcode } from "@/lib/common/utils";
import Image from "next/image";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: number }>;
}) {
  const { slug } = await params;
  const franchiseInfo = await getFranchiseBySlugCached(String(slug));
  const primary = toHexcode(franchiseInfo?.Brand.colorPrimary);
  const secondary = toHexcode(franchiseInfo?.Brand.colorSecondary);

  console.log(franchiseInfo);
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
            className="absolute inset-0 size-full object-cover sm:object-top lg:object-[50%_60%] opacity-20"
          />
          <div className="italic font-semibold tracking-tight text-pretty xl:text-4xl drop-shadow-2xl">
            <h1 className="text-xl">{franchiseInfo.slug}</h1>
            <h1 className="text-4xl">{franchiseInfo.name}</h1>
            <div className="flex flex-row">
              <h2 className="text-xl">GM: {franchiseInfo.GM.name}</h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
