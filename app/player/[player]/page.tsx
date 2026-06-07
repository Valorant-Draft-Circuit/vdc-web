import PlayerAgents from "@/components/player/PlayerAgents";
import PlayerInfo from "@/components/player/PlayerInfo";
import PlayerMaps from "@/components/player/PlayerMaps";
import PlayerNotFound from "@/components/player/PlayerNotFound";
import PlayerSummary from "@/components/player/summary/PlayerSummary";
import ListBox from "@/components/tabs/DropDown";
import HorizontalTab from "@/components/tabs/HorizontalTab";
import { TabElement } from "@/components/tabs/types";
import { getSeasonCached } from "@/lib/common/cache";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { listAllSeasons } from "@/lib/common/season";
import { ControlPanel } from "@/prisma";

type PlayerIGN = {
  encoded: string;
  decoded: string;
};

type Props = {
  params: Promise<{ player: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const NUMBER_REGEX = /^\d+$/;
const ENCODED_DIVIDER = encodeURIComponent("#");

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { player } = await params;
  let playerIGN;
  if (NUMBER_REGEX.test(player)) {
    const res = await fetch(
      `${process.env.URL}/api/users/discord/${player}/riot`,
    );
    if (res.ok) {
      const riotIGN: string = await res.json();
      playerIGN = riotIGN;
    } else {
      playerIGN = "Player";
    }
  } else {
    playerIGN = decodeURIComponent(player);
  }
  return {
    title: `VDC | ${playerIGN}'s Player Page`,
    description: `${playerIGN} information`,
  };
}

export default async function Page({ params, searchParams }: Props) {
  const [{ player }, sp, currentSeason, leagueState] = await Promise.all([
    params,
    searchParams,
    getSeasonCached(),
    ControlPanel.getLeagueState(),
  ]);

  if (NUMBER_REGEX.test(player)) return await handleDiscordIDSearch(player);

  const playerIGN: PlayerIGN = { encoded: "", decoded: "" };
  if (player.includes(ENCODED_DIVIDER)) playerIGN.encoded = player;
  else if (player.includes("-")) {
    const playerSplit = player.split("-");
    playerIGN.encoded = `${playerSplit[0]}${ENCODED_DIVIDER}${playerSplit[1]}`;
  } else {
    return <PlayerNotFound player={decodeURIComponent(player)} />;
  }
  playerIGN.decoded = decodeURIComponent(playerIGN.encoded);

  const listOfAllSeasons = listAllSeasons(currentSeason);
  const seasonsMenu = listOfAllSeasons.map((season) => ({
    query: season,
    name: `SEASON ${season}`,
  }));

  const gameTypeMenu = [
    { query: "season", name: "SEASON" },
    { query: "combine", name: "COMBINE" },
  ];
  if (leagueState === "COMBINES") {
    gameTypeMenu.reverse();
  }

  const defaultType = leagueState === "COMBINES" ? "combine" : "season";
  const validTypes = new Set(["season", "combine"]);
  const validBy = new Set(["summary", "agents", "maps"]);
  const validSeasons = new Set(listOfAllSeasons);

  const seasonOk = typeof sp.season === "string" && validSeasons.has(sp.season);
  const typeOk = typeof sp.type === "string" && validTypes.has(sp.type);
  const byOk = typeof sp.by === "string" && validBy.has(sp.by);

  if (!seasonOk || !typeOk || !byOk) {
    const next = new URLSearchParams();
    next.set("season", seasonOk ? (sp.season as string) : currentSeason.toString());
    next.set("type", typeOk ? (sp.type as string) : defaultType);
    next.set("by", byOk ? (sp.by as string) : "summary");
    redirect(`/player/${player}?${next.toString()}`);
  }

  const tabElements: TabElement[] = [
    {
      query: "Summary",
      color: "vdcRed",
      name: "Summary",
      content: <PlayerSummary />,
    },
    {
      query: "Agents",
      color: "vdcRed",
      name: "Agents",
      content: <PlayerAgents />,
    },
    {
      query: "Maps",
      color: "vdcRed",
      name: "Maps",
      content: <PlayerMaps />,
    },
  ];

  const playerInfo = await getPlayerByRiot(playerIGN.encoded);
  return (
    <div className="mx-auto max-w-7xl pb-10 xl:px-8 xl:py-12">
      <div className="mx-auto xl:max-w-4xl flex flex-col gap-5">
        <PlayerInfo playerInfo={playerInfo} />
        <div className="p-2 flex flex-col xl:gap-5">
          <div className="px-10 xl:px-0 m-auto flex flex-row gap-1 xl:gap-5 w-full">
            <div className="w-full">
              <ListBox
                params={"season"}
                menuElements={seasonsMenu}
                defaultDropDownQuery={currentSeason.toString()}
              />
            </div>
            <div className="w-full">
              <ListBox
                params={"type"}
                menuElements={gameTypeMenu}
                defaultDropDownQuery={defaultType}
              />
            </div>
          </div>
          <HorizontalTab tabElements={tabElements} params={"by"} />
        </div>
      </div>
    </div>
  );
}

async function handleDiscordIDSearch(discordID: string) {
  // TODO: rename api so its clear we are searching by discordID
  const res = await fetch(
    `${process.env.URL}/api/users/discord/${discordID}/riot`,
  );
  if (res.ok) {
    const riotIGN: string = await res.json();
    const encodedIGN = encodeURIComponent(riotIGN);
    redirect(`/player/${encodedIGN}`);
  } else {
    return <PlayerNotFound player={discordID} />;
  }
}

async function getPlayerByRiot(riotIGN) {
  const res = await fetch(`${process.env.URL}/api/player/${riotIGN}`);
  if (res.ok) {
    const data: string = await res.json();
    return data;
  } else {
    return <PlayerNotFound player={riotIGN} />;
  }
}

// async function getPlayerStatsByCurrentSeason(riotIGN) {
//   const res = await fetch(`${process.env.URL}/api/player/stats/${riotIGN}`);
//   if (res.ok) {
//     const data: string = await res.json();
//     return data;
//   } else {
//     return null;
//   }
// }
