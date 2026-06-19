import { Tier } from "@prisma/client";

import { getAdvanceBoard } from "@/lib/queries/pickems/getAdvanceBoard";
import { getMyPicks } from "@/lib/queries/pickems/getUserPicks";
import AdvancePicker from "@/components/pickems/advancement/AdvancePicker";

type Props = {
  tier: Tier;
  season: number;
  userId: string | null;
  locked: boolean;
  accent: string;
  canSave: boolean;
};

export default async function AdvanceBoardPanel({
  tier,
  season,
  userId,
  locked,
  accent,
  canSave,
}: Props) {
  const [board, myPicks] = await Promise.all([
    getAdvanceBoard(tier, season),
    userId ? getMyPicks(userId, season, tier) : Promise.resolve(null),
  ]);

  if (board.teams.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-vdcGrey dark:text-gray-400">
        No teams found for this tier and season.
      </p>
    );
  }

  return (
    <AdvancePicker
      board={board}
      initial={myPicks?.advance}
      tier={tier}
      locked={locked}
      accent={accent}
      canSave={canSave}
    />
  );
}
