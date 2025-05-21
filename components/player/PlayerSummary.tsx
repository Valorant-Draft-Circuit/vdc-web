export default async function PlayerSummary({ playerIGN }: { playerIGN }) {
  const playerStats = await getPlayerStatsBySeason(playerIGN.encoded, 7);
  if (!playerStats) {
    console.log("no stats found");
  }
  return (
    <div>
      <h1>Player Summary</h1>
    </div>
  );
}

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
