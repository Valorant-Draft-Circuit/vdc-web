import MapBan from "@/components/match/MapBan";
import MatchStats from "@/components/match/MatchStats";
import {
  MAPS,
  SECONDARY_MAP_LIST_URL,
  TEAM_LOGOS_URL,
  TIER_COLOR_MAP,
} from "@/lib/common/constants";
import { toTailwindCustomHexCode } from "@/lib/common/utils";
import { getMatch } from "@/lib/queries/match/match";
import { CheckBadgeIcon } from "@heroicons/react/24/outline";
import { MapBansSide, MapBanType } from "@prisma/client";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

type TPlayedMapBans = {
  id: number;
  matchID: number;
  order: number;
  type: MapBanType;
  team: number | null;
  map: string | null;
  side: MapBansSide | null;
  gameId?: string;
};

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
  searchParams,
}: {
  params: Promise<{ matchId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { matchId } = await params;
  const matchInfo = await getMatch(matchId);
  const gameId = (await searchParams).game;
  const gameOverview = matchInfo?.Games.find((game) => game.gameID === gameId);
  const mapPick = matchInfo?.MapBans.find(
    (mapBan) => mapBan.map === gameOverview?.map
  )?.team;

  const gameOverviewWithTeam = gameOverview
    ? { ...gameOverview, mapPick }
    : null;

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
  const playedMapBans: TPlayedMapBans[] = [];

  let homeWins = 0,
    awayWins = 0;

  matchGames?.forEach((game) => {
    if (game.winner === homeTeam?.id) homeWins++;
    else awayWins++;

    matchInfo?.MapBans.forEach((mapBan) => {
      if (game.map === mapBan.map) {
        playedMapBans.push({
          ...mapBan,
          gameId: game.gameID,
        });
      }
    });
  });

  const mapBans = matchInfo?.MapBans?.filter(
    (mapban) =>
      mapban.type !== MapBanType.PICK && mapban.type !== MapBanType.DECIDER
  );

  const mapBansWithGameId = [...(mapBans ?? []), ...(playedMapBans ?? [])];
  mapBansWithGameId.sort(
    (firstItem, secondItem) => firstItem.order - secondItem.order
  );

  const matchDate = new Date(matchInfo!.dateScheduled).toLocaleString(`en-US`, {
    month: `short`,
    day: `2-digit`,
    weekday: "short",
    year: `numeric`,
  });

  const hasMapBaps = matchInfo?.MapBans.length !== 0;
  return (
    <div className="mx-auto max-w-7xl pb-10 xl:px-8 xl:py-12">
      <div className="mx-auto xl:max-w-7xl">
        <div className="relative xl:col-span-5 xl:rounded-3xl px-3 xl:px-10 py-10 overflow-hidden xl:shadow-2xl">
          <div
            className="absolute inset-0 bg-gradient-to-r from-[var(--h)] to-[var(--a)] brightness-20"
            style={
              {
                "--h": homeTeamColor,
                "--a": awayTeamColor,
              } as React.CSSProperties
            }
          />

          <div className="relative flex flex-col w-full">
            <div className="flex flex-row justify-between">
              <TeamIdentity team={homeTeam} teamBrand={homeTeamBrand} />
              <div className="flex flex-col text-2xl italic text-center">
                <h1 className={`text-${tierColor} text-lg`}>
                  {matchInfo?.tier}
                </h1>
                <div className="flex flex-row gap-5 italic m-auto text-4xl text-vdcRed">
                  <h1>{homeWins}</h1>
                  <h1>/</h1>
                  <h1>{awayWins}</h1>
                </div>
                <h1 className={`text-lg text-vdcRed`}>
                  {matchInfo?.matchType.replaceAll("_", " ")}
                </h1>
              </div>
              <TeamIdentity team={awayTeam} teamBrand={awayTeamBrand} />
            </div>
          </div>
        </div>
        <div className="flex flex-row justify-between text-lg p-2">
          <h1>SEASON {matchInfo?.season} MATCH DAY 1</h1>
          <h1>{matchDate}</h1>
        </div>
        {hasMapBaps && (
          <div className="p-2">
            <h1>MAP BANS / PICKS</h1>
            <div className="flex flex-col xl:flex-row gap-1 mx-auto">
              {mapBansWithGameId.map((mapBan) => (
                <MapBan key={mapBan.id} mapBan={mapBan} teams={teams} />
              ))}
            </div>
          </div>
        )}
        <div className="flex flex-col gap-4 p-5 xl:p-0 xl:py-5">
          {gameOverview && (
            <MatchOverview gameOverview={gameOverviewWithTeam} teams={teams} />
          )}
          <h1>Match Stats</h1>
          <MatchStats />
        </div>
      </div>
    </div>
  );
}

function MatchOverview({ gameOverview, teams }) {
  const mapUrl = SECONDARY_MAP_LIST_URL(MAPS[gameOverview.map.toUpperCase()]);

  return (
    <>
      <h1>Match Overview</h1>
      <div className="flex flex-col gap-2 relative p-10">
        <Image
          alt={gameOverview.map}
          src={mapUrl}
          width={50000}
          height={50000}
          className={`absolute inset-0 -z-10 size-full object-cover rounded-lg brightness-90`}
        />
        <div className="flex flex-col justify-between text-vdcWhite gap-2">
          <div className="flex flex-col text-sm">
            <h1>{gameOverview.gameType} Game</h1>
            <h2>Rounds played: {gameOverview.rounds}</h2>
          </div>
          <div className="flex flex-row justify-between">
            <OverviewScore
              team={teams.home}
              score={gameOverview.roundsWonHome}
              isHome={true}
              pick={gameOverview.mapPick}
              winner={gameOverview.winner}
            />
            <OverviewScore
              team={teams.away}
              score={gameOverview.roundsWonAway}
              isHome={false}
              pick={gameOverview.mapPick}
              winner={gameOverview.winner}
            />
          </div>
        </div>
      </div>
    </>
  );
}

function OverviewScore({ team, score, isHome, pick, winner }) {
  const mapPick = pick === team.id;
  const isWinner = team.id === winner;
  return (
    <div
      className={`flex flex-row gap-2 xl:gap-5 ${
        !isHome && "flex-row-reverse"
      }`}
    >
      <Image
        alt={team.id}
        src={`${TEAM_LOGOS_URL}${team.Franchise.Brand.logo}`}
        width={50000}
        height={50000}
        className="size-10 xl:size-15 m-auto"
      />
      <h1
        className={`text-xl m-auto xl:text-3xl ${
          isWinner ? "text-vdcGreen" : "text-vdcRed"
        }`}
      >
        {score}
      </h1>
      {mapPick && (
        <div
          className={`flex flex-row m-auto gap-2 ${
            !isHome && "flex-row-reverse"
          }`}
        >
          <CheckBadgeIcon className="size-5 m-auto" />
          <h1 className="hidden xl:block">MAP PICK</h1>
        </div>
      )}
    </div>
  );
}

function TeamIdentity({ team, teamBrand }) {
  const franchiseSlug = team?.Franchise.slug;

  return (
    <div className="flex flex-col text-center w-1/3 hover:brightness-80">
      <h1 className="text-vdcWhite italic">{team?.Franchise.slug}</h1>
      <Link href={`/franchises/${franchiseSlug}?team=${team.tier}`}>
        <Image
          alt={`${teamBrand?.logo}`}
          src={`${TEAM_LOGOS_URL}${teamBrand?.logo}`}
          width={500}
          height={500}
          className="size-25 xl:size-50 drop-shadow-lg m-auto"
        />
      </Link>
      <h1 className="text-vdcWhite italic truncate">{team?.name}</h1>
    </div>
  );
}
