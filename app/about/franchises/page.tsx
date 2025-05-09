import FranchiseCard from "@/components/franchises/FranchiseCard";
import {
  getAllActiveFranchisesCached,
  getSeasonCached,
} from "@/lib/common/cache";
import Image from "next/image";

export default async function Page() {
  const currentSeason = await getSeasonCached();
  const franchises = await getAllActiveFranchisesCached();

  return (
    <div className="mx-auto max-w-7xl pb-10 xl:px-8 xl:py-12">
      <div className="mx-auto xl:max-w-4xl">
        <div className="relative xl:col-span-5 xl:rounded-3xl px-10 py-32 overflow-hidden xl:shadow-2xl">
          <Image
            alt="hero image"
            src="/about-hero-image.webp"
            width={5000}
            height={5000}
            className="absolute inset-0 -z-10 size-full object-cover sm:object-top lg:object-[10%_10%] brightness-20"
          />
          <h1 className="text-3xl italic font-semibold tracking-tight text-pretty text-vdcRed xl:text-4xl">
            Season {currentSeason} franchises
          </h1>
          <h2 className="mt-4 text-base/7 text-pretty text-vdcWhite italic">
            These following franchises and their teams battle for the VDC S{currentSeason} trophy
            in each tier. <br />
            Click on a franchise to learn more about them!
          </h2>
        </div>

        <div className="mt-10 xl:mt-5 flex flex-col mx-2 p-5 rounded-xl gap-2 drop-shadow-2xl xl:grid xl:grid-cols-3 xl:gap-4">
          {franchises?.map((franchise, index) => (
            <FranchiseCard key={index} franchise={franchise} />
          ))}
        </div>
      </div>
    </div>
  );
}
