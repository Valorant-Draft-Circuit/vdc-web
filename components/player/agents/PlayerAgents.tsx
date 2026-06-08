import { GameType } from "@prisma/client";
import CombineDisclaimer from "@/components/player/CombineDisclaimer";
import type { PlayerAgentBreakdown } from "@/lib/queries/stats/getPlayerAgentBreakdown";
import type { TeamLogoMap } from "@/lib/queries/teams/teams";
import AgentTable from "./AgentTable";
import HeroAgentCard from "./HeroAgentCard";
import RoleDistribution from "./RoleDistribution";

type Props = {
  breakdown: PlayerAgentBreakdown[];
  selected: PlayerAgentBreakdown;
  selectedSlug: string;
  gameType: GameType;
  teamMap: TeamLogoMap;
  basePath: string;
  searchParams: Record<string, string | string[] | undefined>;
};

export default function PlayerAgents({
  breakdown,
  selected,
  selectedSlug,
  gameType,
  teamMap,
  basePath,
  searchParams,
}: Props) {
  return (
    <div className="flex flex-col gap-3">
      {gameType === GameType.COMBINE && <CombineDisclaimer />}
      <RoleDistribution breakdown={breakdown} />
      <HeroAgentCard entry={selected} teamMap={teamMap} gameType={gameType} />
      <AgentTable
        rows={breakdown}
        selectedSlug={selectedSlug}
        basePath={basePath}
        searchParams={searchParams}
      />
    </div>
  );
}
