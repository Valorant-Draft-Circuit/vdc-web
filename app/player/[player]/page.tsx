import PlayerInfo from "@/components/player/PlayerInfo";
import PlayerNotFound from "@/components/player/PlayerNotFound";
import { redirect } from "next/navigation";
type PlayerIGN = {
  encoded: string;
  decoded: string;
};
export default async function Page({
  params,
}: {
  params: Promise<{ player: string }>;
}) {
  const ENCODED_DIVIDER = encodeURIComponent("#");
  const NUMBER_REGEX = /^\d+$/;
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

  const playerInfo = await getPlayerByRiot(playerIGN.encoded);
  const playerStats = await getPlayerStatsBySeason(playerIGN.encoded, 7);
  if (!playerStats) {
    console.log("no stats found");
  }
  console.log(playerInfo);
  return (
    <div className="mx-auto max-w-7xl pb-10 xl:px-8 xl:py-12">
      <div className="mx-auto xl:max-w-4xl flex flex-col gap-5">
        <PlayerInfo playerInfo={playerInfo} />
      </div>
      <div></div>
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

async function getPlayerStatsBySeason(riotIGN, season) {
  const res = await fetch(
    `${process.env.URL}/api/player/stats/${riotIGN}?season=${season}`
  );
  if (res.ok) {
    const data: string = await res.json();
    return data;
  } else {
    return null;
  }
}
