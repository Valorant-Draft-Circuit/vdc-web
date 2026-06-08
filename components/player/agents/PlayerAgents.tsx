import type { ReactNode } from "react";
import { GameType } from "@prisma/client";
import CombineDisclaimer from "@/components/player/CombineDisclaimer";
import type { PlayerAgentBreakdown } from "@/lib/queries/stats/getPlayerAgentBreakdown";
import type { TeamLogoMap } from "@/lib/queries/teams/teams";
import AgentTable from "./AgentTable";
import HeroAgentCard from "./HeroAgentCard";
import RoleDistribution from "./RoleDistribution";
import ShareableHero from "./ShareableHero";

type Props = {
  breakdown: PlayerAgentBreakdown[];
  selected: PlayerAgentBreakdown;
  selectedSlug: string;
  gameType: GameType;
  teamMap: TeamLogoMap;
  basePath: string;
  searchParams: Record<string, string | string[] | undefined>;
  captureLabel?: ReactNode;
};

export default function PlayerAgents({
  breakdown,
  selected,
  selectedSlug,
  gameType,
  teamMap,
  basePath,
  searchParams,
  captureLabel,
}: Props) {
  return (
    <div className="flex flex-col gap-3">
      {gameType === GameType.COMBINE && <CombineDisclaimer />}
      <RoleDistribution breakdown={breakdown} />
      <ShareableHero>
        <HeroAgentCard
          entry={selected}
          teamMap={teamMap}
          gameType={gameType}
          captureLabel={captureLabel}
        />
      </ShareableHero>
      <AgentTable
        rows={breakdown}
        selectedSlug={selectedSlug}
        basePath={basePath}
        searchParams={searchParams}
      />
    </div>
  );
}
