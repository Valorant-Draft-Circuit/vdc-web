import { Tier } from "@prisma/client";
import { getScheduleByTierCached } from "@/lib/common/cache";
import SchedulePanel from "./SchedulesPanel";

type Props = {
  tier: Tier;
  season: number;
};

export default async function SchedulePanelLoader({ tier, season }: Props) {
  const schedule = await getScheduleByTierCached(tier, season);
  return <SchedulePanel tier={tier} season={season} schedule={schedule} />;
}
