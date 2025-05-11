import { TEAM_LOGOS_URL } from "@/lib/common/constants";
import Image from "next/image";
import Link from "next/link";

export type StandingProps = {
  franchiseSlug: string;
  teamLogo: string | null;
  teamName: string;
  wins: number;
  losses: number;
  rwp: number;
};

export default function StandingsCard({
  standing,
  ranking,
  apexRanks,
  query,
}: {
  standing: StandingProps;
  ranking: number;
  apexRanks: number;
  query: string;
}) {
  const tier = query.toLocaleLowerCase();
  const link =
    query !== "franchises"
      ? `/about/franchises/${standing.franchiseSlug}?team=${tier}`
      : `/about/franchises/${standing.franchiseSlug}`;
  return (
    <>
      <Link href={link}>
        <div className="hover:cursor-pointer hover:scale-102 transition-transform ease-in-out duration-150 flex flex-row gap-10 rounded-2xl xl:w-full bg-vdcWhite dark:bg-vdcGrey py-4 px-5 xl:px-24 drop-shadow-lg">
          <div className="my-auto">
            <h1
              className={`${
                ranking <= apexRanks ? "text-vdcRed" : ""
              } italic text-5xl xl:text-6xl min-w-5 xl:min-w-17`}
            >
              {ranking}
            </h1>
          </div>
          <div className="flex my-auto drop-shadow-md">
            <Image
              src={`${TEAM_LOGOS_URL}${standing.teamLogo}`}
              alt={standing.franchiseSlug}
              width={250}
              height={250}
              className="w-20 drop-shadow-md"
            />
          </div>
          <div className="flex flex-col my-auto">
            <h1 className="md:hidden italic text-2xl">
              {standing.franchiseSlug}
            </h1>
            <h1 className="hidden md:block italic text-lg xl:text-2xl">
              {standing.teamName}
            </h1>
            <h1 className="italic text-sm xl:text-sm">
              {standing.wins}W {standing.losses}L
            </h1>
            <h1 className="italic text-sm xl:text-sm">RWP: {standing.rwp}%</h1>
          </div>
        </div>
      </Link>
    </>
  );
}
