import {
  MAP_LIST_URL,
  MAPS,
  TEAM_LOGOS_URL,
  TIER_COLOR_MAP,
} from "@/lib/common/constants";
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

  const teams = {
    home: homeTeam,
    away: awayTeam,
  };

  const homeTeamBrand = homeTeam?.Franchise.Brand;
  const awayTeamBrand = awayTeam?.Franchise.Brand;

  const tierColor = TIER_COLOR_MAP[matchInfo!.tier];
  const homeTeamColor = toTailwindCustomHexCode(homeTeamBrand!.colorPrimary);
  const awayTeamColor = toTailwindCustomHexCode(awayTeamBrand!.colorPrimary);

  const matchGames = matchInfo?.Games;
  let homeWins = 0,
    awayWins = 0;
  matchGames?.forEach((game) => {
    if (game.winner === homeTeam?.id) homeWins++;
    else awayWins++;
  });

  const matchDate = new Date(matchInfo!.dateScheduled).toLocaleString(`en-US`, {
    month: `short`,
    day: `2-digit`,
    weekday: "short",
    year: `numeric`,
  });

  return (
    <div className="mx-auto max-w-7xl pb-10 xl:px-8 xl:py-12">
      <div className="mx-auto xl:max-w-5xl">
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
              <div className="flex flex-col text-2xl italic">
                <h1 className={`text-${tierColor}`}>{matchInfo?.tier}</h1>
                <div className="flex flex-row gap-5 italic m-auto text-4xl text-vdcRed">
                  <h1>{homeWins}</h1>
                  <h1>/</h1>
                  <h1>{awayWins}</h1>
                </div>
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
        <div className="flex flex-row justify-between text-lg p-2">
          <h1>SEASON {matchInfo?.season} MATCH DAY 1</h1>
          <h1>{matchDate}</h1>
        </div>
        <div className="p-2">
          <h1>MAP BANS / PICKS</h1>
          <div className="flex flex-col xl:flex-row gap-1">
            {matchInfo?.MapBans.map((mapBan) => (
              <MapBan key={mapBan.id} mapBan={mapBan} teams={teams} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

async function MapBan({ mapBan, teams }) {
  const mapUrl = MAP_LIST_URL(MAPS[mapBan.map.toUpperCase()]);
  const isBan = mapBan.type === "BAN";
  const isDiscard = mapBan.type === "DISCARD";
  const { home, away } = teams;
  let team;
  if (mapBan.team === home.id) {
    team = home;
  } else {
    team = away;
  }

  return (
    <div className="relative">
      <Image
        alt={mapBan.map}
        src={mapUrl}
        width={5000}
        height={5000}
        className={` absolute inset-0 -z-10 size-full object-cover brightness-30 ${
          (isBan || isDiscard) && "grayscale"
        }`}
      />
      <div className="flex flex-row xl:flex-col italic p-5 gap-5 justify-between">
        <div className="flex flex-row xl:flex-col gap-5 drop-shadow-lg text-vdcWhite my-auto xl:m-auto xl:text-center">
          <h1>{mapBan.map}</h1>
          <h1>-</h1>
          <h1>{mapBan.type}</h1>
        </div>
        <div>
          <Image
            alt={team?.name}
            src={`${TEAM_LOGOS_URL}${team?.Franchise.Brand.logo}`}
            width={5000}
            height={5000}
            className="size-10 xl:size-25 "
          />
        </div>
      </div>
    </div>
  );
}
