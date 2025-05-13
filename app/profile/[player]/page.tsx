import PlayerNotFound from "@/components/profile/PlayerNotFound";
import { redirect } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ player: string }>;
}) {
  const ENCODED_DIVIDER = encodeURIComponent("#");
  const NUMBER_REGEX = /^\d+$/;
  const { player } = await params;
  let playerRiotIGN: string;
  if (NUMBER_REGEX.test(player)) return await handleDiscordIDSearch(player);
  else if (player.includes(ENCODED_DIVIDER))
    playerRiotIGN = decodeURIComponent(player);
  else if (player.includes("-")) {
    const playerSplit = player.split("-");
    playerRiotIGN = decodeURIComponent(`${playerSplit[0]}#${playerSplit[1]}`);
  } else {
    return <PlayerNotFound player={decodeURIComponent(player)} />;
  }
  return <h1>{playerRiotIGN}</h1>;
}

async function handleDiscordIDSearch(discordID: string) {
  // TODO: rename api so its clear we are searching by discordID
  const res = await fetch(`${process.env.URL}/api/users/${discordID}`);
  if (res.ok) {
    const riotIGN: string = await res.json();
    const encodedIGN = encodeURIComponent(riotIGN);
    redirect(`/profile/${encodedIGN}`);
  } else {
    return <PlayerNotFound player={discordID} />;
  }
}