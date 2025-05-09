import FranchiseCard from "@/components/franchises/FranchiseCard";
import { getSeasonCached } from "@/lib/common/cache";
import Image from "next/image";

export default async function Page() {
  const currentSeason = await getSeasonCached();
  const franchises = [
    {
      logo: "pn.png",
      name: "PROJECT NOVA",
      franchiseSlug: "PN",
      primaryColor: "0x9A82B0",
      secondaryColor: "0x000000",
    },
    {
      logo: "gg.png",
      name: "Galactic Gladiators",
      franchiseSlug: "GG",
      primaryColor: "0xE40000",
      secondaryColor: "0x7C7C7C",
    },
    {
      logo: "mox.png",
      name: "Monarch-X",
      franchiseSlug: "MOX",
      primaryColor: "0x010001",
      secondaryColor: "0xEF4F90",
    },
  ];
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
            season {currentSeason} franchises
          </h1>
        </div>

        <div className="mt-10 flex flex-col mx-2 p-5 rounded-xl gap-2 drop-shadow-2xl">
          {franchises?.map((franchise, index) => (
            <FranchiseCard key={index} franchise={franchise} />
          ))}
        </div>
      </div>
    </div>
  );
}
