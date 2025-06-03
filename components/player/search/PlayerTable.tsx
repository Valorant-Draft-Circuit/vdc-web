import { fetchPlayersPage } from "@/lib/queries/player/player";
import { SearchType } from "@/app/player/page";

export default async function PlayerTable({
  query,
  currentPage,
}: {
  query: {
    user: string;
    tier: string;
    leagueStatus: string;
  };
  currentPage: number;
}) {
  const { users } = await fetchPlayersPage({
    tier: query.tier.toUpperCase() as any, // cast to Tier
    leagueStatus: query.leagueStatus.toUpperCase() as any, // cast to LeagueStatus
    user: query.user,
    searchType: SearchType.RIOT_IGN, // or use prop if dynamic
    page: currentPage,
  });

  if (!users.length) {
    return <p className="text-gray-500 italic pt-4">No players found.</p>;
  }

  return (
    <ul className="pt-4 space-y-2">
      {users.map((user, i) => (
        <li key={i} className="p-4 border rounded bg-white shadow">
          <h3 className="text-lg font-semibold">{user.name}</h3>
          <p className="text-sm text-gray-600">
            MMR: {user.PrimaryRiotAccount?.MMR?.mmrEffective ?? "N/A"}
          </p>
          <p className="text-sm text-gray-600">
            Franchise: {user.Team?.Franchise?.name ?? "None"}
          </p>
        </li>
      ))}
    </ul>
  );
}
