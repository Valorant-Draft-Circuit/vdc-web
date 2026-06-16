import { MatchType } from "@prisma/client";

export const MIN_GAMES_BY_MATCH_TYPE: Partial<Record<MatchType, number>> = {
  [MatchType.BO2]: 2,
  [MatchType.BO3]: 2,
  [MatchType.BO5]: 3,
};
