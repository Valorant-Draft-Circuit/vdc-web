import Player from "@/components/profile/Player";
import PlayerNotFound from "@/components/profile/PlayerNotFound";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default async function Page({ params }: { params: { search: string } }) {
  const { search } = await params;
  const decodedSearch = decodeURIComponent(search);

  // check if they passed in a discordID
  handleDiscordIDSearch(decodedSearch);
  return (
    <Suspense fallback={"Loading player..."}>
      <Player riotIGN={decodedSearch} />
    </Suspense>
  );
}

async function handleDiscordIDSearch(decodedSearch) {
  const numberRegex = /^\d+$/;
  if (numberRegex.test(decodedSearch)) {
    const res = await fetch(`${process.env.URL}/api/users/${decodedSearch}`);
    if (res.ok) {
      const riotIGN: string = await res.json();
      const encodedIGN = encodeURIComponent(riotIGN);
      redirect(`/profile/${encodedIGN}`);
    } else {
      return <PlayerNotFound player={decodedSearch} />;
    }
  }
}
