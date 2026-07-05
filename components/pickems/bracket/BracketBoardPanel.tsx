import { Tier } from "@prisma/client";

import {
  getBracketBoard,
  getUserBracketPicks,
} from "@/lib/queries/pickems/getBracketBoard";
import BracketPicker from "./BracketPicker";

type Props = {
  tier: Tier;
  season: number;
  userId: string | null;
  locked: boolean;
  accent: string;
};

export default async function BracketBoardPanel({
  tier,
  season,
  userId,
  locked,
  accent,
}: Props) {
  const [{ bracket }, myPicks] = await Promise.all([
    getBracketBoard(tier, season),
    userId ? getUserBracketPicks(userId, season, tier) : Promise.resolve([]),
  ]);

  if (bracket.rounds.length === 0 || !bracket.seeded) {
    return (
      <p className="py-10 text-center text-sm text-vdcGrey dark:text-gray-400">
        The bracket opens once playoffs are seeded at the end of the regular
        season.
      </p>
    );
  }
  if (!bracket.isInferable) {
    return (
      <p className="py-10 text-center text-sm text-vdcGrey dark:text-gray-400">
        This tier&apos;s playoff format does not map to a standard bracket, so
        bracket picks are not available.
      </p>
    );
  }

  return (
    <BracketPicker
      bracket={bracket}
      initial={myPicks}
      tier={tier}
      locked={locked}
      accent={accent}
      canSave={userId !== null}
    />
  );
}
