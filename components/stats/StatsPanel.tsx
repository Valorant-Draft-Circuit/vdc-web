import { getSeasonCached } from "@/lib/common/cache";
import { isTier } from "@/lib/common/utils";
import { Tier } from "@prisma/client";

export default async function StatsPanel({
  tier,
  season,
}: {
  tier: Tier;
  season?: number;
}) {
  const currentSeason = await getSeasonCached();
  let seasonNum = season;
  if (!seasonNum) {
    seasonNum = currentSeason;
  }
  let tierString;

  if (isTier(tierString)) {
    tier = tierString;
  }
  return (
    <div className="mx-auto py-2 max-w-7xl xl:py-12 flex flex-col gap-10">
      <h1 className="text-vdcRed italic text-xl text-center xl:ml-30"></h1>
    </div>
  );
}
