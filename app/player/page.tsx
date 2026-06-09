import PlayerSearch from "@/components/player/search/Search";
import { ControlPanel } from "@/prisma";
import Image from "next/image";

export default async function Page() {
  const mmrShow = await ControlPanel.getMMRDisplayState();
  return (
    <div className="mx-auto max-w-7xl pb-10 xl:px-8 xl:py-12">
      <div className="mx-auto xl:max-w-7xl">
        <div className="relative xl:col-span-5 xl:rounded-3xl px-10 py-32 overflow-hidden xl:shadow-md">
          <Image
            alt="hero image"
            src="/player-search-hero.webp"
            width={5000}
            height={5000}
            className="absolute inset-0 -z-10 size-full object-cover sm:object-top lg:object-[10%_50%] brightness-20"
          />
          <h1 className="text-3xl font-semibold tracking-tight  text-vdcRed xl:text-4xl">
            Player Search
          </h1>
          <h2 className="mt-4 text-base/7 text-vdcWhite ">
            Need to scout? Looking for sub? Someone kept killing you over and
            over and over and over? Look &apos;em up here!
          </h2>
        </div>
        <PlayerSearch mmrShow={mmrShow} />
      </div>
    </div>
  );
}
