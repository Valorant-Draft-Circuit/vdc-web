import Pagination from "@/components/player/search/Pagination";
import PlayerTable from "@/components/player/search/PlayerTable";
import PlayerSearch from "@/components/player/search/Search";
import ListBox from "@/components/tabs/DropDown";
import { TIER_ORDER, TIERS_LIST } from "@/lib/common/constants";
import { fetchPlayersPage } from "@/lib/queries/player/player";
import { LeagueStatus, Tier } from "@prisma/client";
import { Suspense } from "react";

export enum SearchType {
  RIOT_IGN = "Riot IGN",
  DISCORD_ID = "Discord User ID",
}

export default async function Page(props: {
  searchParams?: Promise<{
    user?: string;
    searchType?: SearchType;
    tier?: string;
    leagueStatus?: string;
    page?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const searchTypeStr = searchParams?.searchType || SearchType.RIOT_IGN;
  const validSearchTypes = Object.values(SearchType);
  const searchType = validSearchTypes.includes(searchTypeStr as SearchType)
    ? (searchTypeStr as SearchType)
    : SearchType.RIOT_IGN;

  const user = searchParams?.user || "";
  const tierStr = searchParams?.tier || "MYTHIC";
  const leagueStatusStr = searchParams?.leagueStatus || "APPROVED";
  const currentPage = Number(searchParams?.page) || 1;
  

  const validStatuses = Object.values(LeagueStatus);
  validStatuses.sort();
  const statusList = validStatuses.map((status) => ({
    query: status.toLocaleLowerCase(),
    name: status.replace("_", " "),
  }));
  const tierList = TIER_ORDER.map((tier) => ({
    query: tier.toLocaleLowerCase(),
    name: tier,
  }));

  const leagueStatus = validStatuses.includes(leagueStatusStr as LeagueStatus)
    ? (leagueStatusStr as LeagueStatus)
    : undefined;
  let totalPages = 1;
  if (tierStr) {
    const result = await fetchPlayersPage({
      tier: tierStr as Tier,
      searchType,
      leagueStatus,
      user,
      page: currentPage,
    });
    totalPages = result.totalPages;
  }

  const query = { user: user, tier: tierStr, leagueStatus: leagueStatusStr };
  return (
    <div className="mx-auto max-w-7xl p-10 xl:px-8 xl:py-12">
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2">
          <h1 className="text-vdcRed italic text-3xl">Player Search</h1>
          <h2 className=" italic text-lg">
            Need to scout? Looking for a sub? Someone kept killing you over and
            over and over and over? Look &apos;em up here.
          </h2>
        </div>
        <div>
          <div className="flex flex-row justify-between">
            <div className="flex flex-row gap-2">
              <div className="w-56">
                <ListBox params={"tier"} menuElements={tierList} />
              </div>
              <div className="w-56">
                <ListBox params={"status"} menuElements={statusList} />
              </div>
            </div>
            <PlayerSearch />
          </div>
        </div>

        <div>
          <Suspense key={user + currentPage}>
            <PlayerTable query={query} currentPage={currentPage} />
          </Suspense>
        </div>
        <div>
          <Pagination totalPages={totalPages} />
        </div>
      </div>
    </div>
  );
}
