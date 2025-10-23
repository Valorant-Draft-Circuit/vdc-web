import { TEAM_LOGOS_URL } from "@/lib/common/constants";
import { toTailwindCustomHexCode } from "@/lib/common/utils";
import { getMatch } from "@/lib/queries/match/match";
import { Metadata } from "next";
import Image from "next/image";

type Props = {
  params: Promise<{ matchId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { matchId } = await params;
  return {
    title: `VDC | Match ${matchId}`,
    description: `Match ${matchId}`,
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ matchId: string }>;
}) {
  const { matchId } = await params;
  const matchInfo = await getMatch(matchId);

  const homeTeam = matchInfo?.Home;
  const awayTeam = matchInfo?.Away;

  const homeTeamBrand = homeTeam?.Franchise.Brand;
  const awayTeamBrand = awayTeam?.Franchise.Brand;

  const homeTeamColor = toTailwindCustomHexCode(homeTeamBrand!.colorPrimary);
  const awayTeamColor = toTailwindCustomHexCode(awayTeamBrand!.colorPrimary);
  console.log(matchInfo);

  const matchGames = matchInfo?.Games;
  let homeWins = 0,
    awayWins = 0;
  matchGames?.forEach((game) => {
    if (game.winner === homeTeam?.id) homeWins++;
    else awayWins++;
  });

  console.log(homeWins, awayWins);

  const matchDate = new Date(matchInfo!.dateScheduled).toLocaleString(`en-US`, {
    month: `short`,
    day: `2-digit`,
    weekday: "short",
    year: `numeric`,
  });

  return (
    <div className="mx-auto max-w-7xl pb-10 xl:px-8 xl:py-12">
      <div className="mx-auto xl:max-w-4xl">
        <div className="relative xl:col-span-5 xl:rounded-3xl px-10 py-10 overflow-hidden xl:shadow-2xl">
          <div
            className="absolute inset-0 bg-gradient-to-r from-[var(--h)] to-[var(--a)] brightness-40"
            style={
              {
                "--h": homeTeamColor,
                "--a": awayTeamColor,
              } as React.CSSProperties
            }
          />

          <div className="relative flex flex-col w-full">
            <div className="flex flex-row justify-between">
              <Image
                alt={`${homeTeamBrand?.logo}`}
                src={`${TEAM_LOGOS_URL}${homeTeamBrand?.logo}`}
                width={500}
                height={500}
                className="size-25 xl:size-50 drop-shadow-lg"
              />
              <div className="flex flex-row gap-5 italic my-auto text-4xl text-vdcRed">
                <h1>{homeWins}</h1>
                <h1>/</h1>
                <h1>{awayWins}</h1>
              </div>

              <Image
                alt={`${awayTeamBrand?.logo}`}
                src={`${TEAM_LOGOS_URL}${awayTeamBrand?.logo}`}
                width={500}
                height={500}
                className="size-25 xl:size-50 drop-shadow-lg"
              />
            </div>
          </div>
        </div>
        <div className="flex flex-row justify-between text-vdcRed italic text-lg">
          <h1>SEASON {matchInfo?.season} MATCH DAY 1</h1>
          <h1>{matchDate}</h1>
        </div>
      </div>
    </div>
  );
}
