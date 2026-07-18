import { Metadata } from "next";

import { auth } from "@/lib/auth/auth";
import { getAgentsCached, getSeasonCached } from "@/lib/common/cache";
import { buildAgentOptions } from "@/lib/common/constants/agents";
import { getMyGroups } from "@/lib/queries/pickems/getGroups";
import { requirePickemsEnabled } from "@/lib/pickems/guard";
import GroupsPanel from "@/components/pickems/groups/GroupsPanel";
import HubButton from "@/components/pickems/common/HubButton";

export const metadata: Metadata = {
  title: "VDC | Pick'ems Groups",
  description: "Create or join private Pick'ems groups.",
};

export default async function GroupsPage() {
  await requirePickemsEnabled();

  const [season, session, agents] = await Promise.all([
    getSeasonCached(),
    auth(),
    getAgentsCached(),
  ]);
  const userId = session?.user?.id ?? null;
  const agentOptions = buildAgentOptions(agents);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <HubButton />
        <h1 className="text-2xl font-extrabold">VDC Pick&apos;ems GROUPS</h1>
      </div>

      {userId === null ? (
        <p className="py-10 text-center text-sm text-vdcGrey dark:text-gray-400">
          Log in to create or join Pick&apos;ems groups.
        </p>
      ) : (
        <GroupsPanel
          groups={await getMyGroups(userId, season)}
          season={season}
          agentOptions={agentOptions}
        />
      )}
    </div>
  );
}
