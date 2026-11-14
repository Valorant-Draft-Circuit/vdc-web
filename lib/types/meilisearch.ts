export type MeiliPlayer = {
  id: string;
  discordId: string;
  discordName: string;
  riotIGN: string;
  tier: string;
  mmrEffective?: number | null;
  teamName: string;
  franchiseSlug: string;
  franchiseLogo: string;
  leagueStatus: string;
  image: string;
  banner: string | null;
};
