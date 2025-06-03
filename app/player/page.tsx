import PlayerTable from "@/components/player/PlayerTable";
import PlayerSearch from "@/components/query/Search";
import { Suspense } from "react";

/**
 * TODO: make a user search page.
 * For now, just redirect to home.
 */
export default async function Page(props: {
  searchParams?: Promise<{
    user?: string;
    page?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.user || "";
  const currentPage = Number(searchParams?.page) || 1;
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
          <PlayerSearch />
        </div>
        <div>
          <Suspense key={query + currentPage}>
            <PlayerTable query={query} currentPage={currentPage} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
