export const HEADERS = [
  "AGENT",
  "DISCORD",
  "NAME",
  "FRANCHISE",
  "TEAM",
  "MMR",
  "TIER",
  "LEAGUE_STATUS",
  "CONTRACT_STATUS",
  "CONTRACT_REMAINING",
  "MP",
  "ATK_RATING",
  "DEF_RATING",
  "ACS",
  "K",
  "D",
  "A",
  "KD",
  "KPR",
  "APR",
  "ADR",
  "PLANTS",
  "DEFUSES",
  "ECO_KILLS",
  "ANTIECO_KILLS",
  "TRADE_KILLS",
  "TRADE_DEATHS",
  "CLUTCHES",
  "FK",
  "FKPR",
  "FD",
  "FDPR",
  "HS",
  "KAST",
];
export const FIELDS = [
  { key: "agent", label: "AGENT" },
  { key: "discord", label: "DISCORD" },
  { key: "name", label: "NAME" },
  { key: "franchise", label: "FRANCHISE" },
  { key: "team", label: "TEAM" },
  { key: "mmr", label: "MMR" },
  { key: "tier", label: "TIER" },
  { key: "leagueStatus", label: "LEAGUE_STATUS" },
  { key: "contractStatus", label: "CONTRACT_STATUS" },
  { key: "contractRemaining", label: "CONTRACT_REMAINING" },
  { key: "matchesPlayed", label: "MP" },
  { key: "attackRating", label: "ATK_RATING" },
  { key: "defenseRating", label: "DEF_RATING" },
  { key: "acs", label: "ACS" },
  { key: "totalKills", label: "K" },
  { key: "totalDeaths", label: "D" },
  { key: "totalAssists", label: "A" },
  { key: "kdr", label: "KD" },
  { key: "kpr", label: "KPR" },
  { key: "apr", label: "APR" },
  { key: "adr", label: "ADR" },
  { key: "totalPlants", label: "PLANTS" },
  { key: "totalDefuses", label: "DEFUSES" },
  //{ key: 'totalExitKills', label: 'EXIT_KILLS' },
  { key: "totalEcoKills", label: "ECO_KILLS" },
  { key: "totalAntiecoKills", label: "ANTIECO_KILLS" },
  { key: "totalTradeKills", label: "TRADE_KILLS" },
  { key: "totalTradeDeaths", label: "TRADE_DEATHS" },
  { key: "totalClutches", label: "CLUTCHES" },
  { key: "firstKills", label: "FK" },
  { key: "fkpr", label: "FKPR" },
  { key: "firstDeaths", label: "FD" },
  { key: "fdpr", label: "FDPR" },
  { key: "hs", label: "HS" },
  { key: "kast", label: "KAST" },
];

export type GroupedPlayerStats = {
  userID: string;
  _sum: {
    kills: number | null;
    deaths: number | null;
    assists: number | null;
    plants: number | null;
    defuses: number | null;
    firstKills: number | null;
    firstDeaths: number | null;
    tradeKills: number | null;
    tradeDeaths: number | null;
    ecoKills: number | null;
    antiEcoKills: number | null;
    ecoDeaths: number | null;
    exitKills: number | null;
    clutches: number | null;
  };
  _avg: {
    acs: number | null;
    ratingAttack: number | null;
    ratingDefense: number | null;
    kast: number | null;
    kills: number | null;
    assists: number | null;
    firstKills: number | null;
    firstDeaths: number | null;
    hsPercent: number | null;
  };
  _count: {
    userID: number;
  };
};

export type PlayerNameTeam = {
  id: string;
  PrimaryRiotAccount: {
    riotIGN: string | null;
  } | null;
  Team: {
    name: string;
  } | null;
};

export type FormattedStat = {
  name: string | null;
  team: string;
  matchesPlayed: number;
  acs: number | null;
  attackRating: number | null;
  defenseRating: number | null;
  totalKills: number | null;
  totalDeaths: number | null;
  totalAssists: number | null;
  totalPlants: number | null;
  totalDefuses: number | null;
  totalEcoKills: number | null;
  totalAntiecoKills: number | null;
  totalTradeKills: number | null;
  totalTradeDeaths: number | null;
  totalClutches: number | null;
  kdr: number | null;
  kast: number | null;
  firstKills: number | null;
  firstDeaths: number | null;
  hs: number | null;
};
