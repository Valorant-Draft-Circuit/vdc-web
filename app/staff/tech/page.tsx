import Link from "next/link";
import PlayerRoleSearch from "@/components/staff/tech/roles/PlayerRoleSearch";
import WebMapbansDashboard from "@/components/staff/tech/webMapbans/WebMapbansDashboard";
import { getSeasonCached } from "@/lib/common/cache";
import { getWebMapbanMetrics } from "@/lib/queries/staff/webMapbans";

export default async function Page() {
  const season = await getSeasonCached();
  const metrics = await getWebMapbanMetrics(season);

  return (
    <div className="flex w-full flex-col gap-8">
      <section>
        <Link
          href="/staff/tech/control"
          className="inline-block rounded bg-vdcRed px-4 py-2 text-vdcWhite hover:bg-red-700"
        >
          <h1>Control Panel</h1>
        </Link>
      </section>

      <section>
        <h1 className="text-vdcRed py-2 text-left text-xl">
          Web Map Bans (Season {season})
        </h1>
        <WebMapbansDashboard metrics={metrics} />
      </section>

      <section>
        <h1 className="text-vdcRed py-2 text-left text-xl">
          Search / Edit User Roles
        </h1>
        <div className="py-4 rounded-lg">
          <PlayerRoleSearch />
        </div>
      </section>
    </div>
  );
}
