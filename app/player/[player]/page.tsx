import PlayerAgents from "@/components/player/PlayerAgents";
import PlayerInfo from "@/components/player/PlayerInfo";
import PlayerMaps from "@/components/player/PlayerMaps";
import PlayerNotFound from "@/components/player/PlayerNotFound";
import PlayerSummary from "@/components/player/summary/PlayerSummary";
import ListBox from "@/components/tabs/DropDown";
import HorizontalTab, { TabElements } from "@/components/tabs/HorizontalTab";
import { getSeasonCached } from "@/lib/common/cache";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

type PlayerIGN = {
  encoded: string;
  decoded: string;
};

type Props = {
  params: Promise<{ player: string }>;
};

const NUMBER_REGEX = /^\d+$/;
const ENCODED_DIVIDER = encodeURIComponent("#");

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { player } = await params;
  let playerIGN;
  if (NUMBER_REGEX.test(player)) {
    const res = await fetch(`${process.env.URL}/api/users/${player}`);
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

export default async function Page({
  params,
}: {
  params: Promise<{ player: string }>;
}) {
  const currentSeason = await getSeasonCached();
  const listOfAllSeasons = listAllSeasons(currentSeason);
  const menuElements = listOfAllSeasons.map((season) => ({
    query: season,
    name: season,
  }));

  const { player } = await params;
  const playerIGN: PlayerIGN = { encoded: "", decoded: "" };
  if (NUMBER_REGEX.test(player)) return await handleDiscordIDSearch(player);
  else if (player.includes(ENCODED_DIVIDER)) playerIGN.encoded = player;
  else if (player.includes("-")) {
    const playerSplit = player.split("-");
    playerIGN.encoded = `${playerSplit[0]}${ENCODED_DIVIDER}${playerSplit[1]}`;
  } else {
    return <PlayerNotFound player={decodeURIComponent(player)} />;
  }
  playerIGN.decoded = decodeURIComponent(playerIGN.encoded);

  const tabElements: TabElements[] = [
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
          <ListBox params={"Season"} menuElements={menuElements} />
          <HorizontalTab tabElements={tabElements} params={"by"} />
        </div>
      </div>
    </div>
  );
}

async function handleDiscordIDSearch(discordID: string) {
  // TODO: rename api so its clear we are searching by discordID
  const res = await fetch(`${process.env.URL}/api/users/${discordID}`);
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

function listAllSeasons(currentSeason: number) {
  const seasons: string[] = [];
  for (let i = currentSeason; i >= 1; i--) {
    seasons.push(String(i));
  }
  return seasons;
}
