import NodeCache from "node-cache";
import { ControlPanel, Franchise, Team } from "@/prisma";
import { minutes, Times } from "./times";
import { Standing } from "../queries/standings/standings";
import {
  getFranchiseStandings,
  getStandingsByTier,
} from "../queries/standings/standings";
import { Prisma, Tier } from "@prisma/client";
import { getScheduleByTier, Schedule } from "../queries/schedule/schedule";
import getFranchiseDetails from "../queries/franchises/franchises";
import { getAgents, getMaps, Agents, Maps } from "./valorant-api";
import { getMMRTierLines, MmrTierLines } from "./tier";
import {
  getMatchNightRecap,
  MatchNightRecap,
} from "../queries/home/matchNight";

let cache: NodeCache;
initCache();

export function initCache() {
  if (!cache) {
    cache = new NodeCache({
      stdTTL: 0,
      checkperiod: minutes(10), // prune expired keys every 10 mins
    });
  }
}

export async function getAgentsCached(): Promise<Agents> {
  const key = "agents";
  const hit = cache.get<Agents>(key);
  if (hit) return hit;

  const agents = await getAgents();
  cache.set(key, agents, Times.DAY);
  return agents;
}

export async function getMapsCached(): Promise<Maps> {
  const key = "maps";
  const hit = cache.get<Maps>(key);
  if (hit) return hit;

  const maps = await getMaps();
  cache.set(key, maps, Times.DAY);
  return maps;
}

export async function getSeasonCached(): Promise<number> {
  const key = "currentSeason";
  const hit = cache.get<number>(key);
  if (hit) return hit;

  const season = await ControlPanel.getSeason();
  cache.set(key, season, Times.DAY);
  return season;
}

// export async function getFaqCached(): Promise<Faq[]> {
//   const key = "faqs";
//   const hit = cache.get<Faq[]>(key);
//   if (hit) return hit;

//   const faqs = await getFaq();
//   cache.set(key, faqs, Times.DAY);
//   return faqs;
// }

export async function getFranchiseStandingsCached(
  season: number,
): Promise<Standing[]> {
  const key = "franchiseStandings";
  const hit = cache.get<Standing[]>(key);
  if (hit !== undefined) return hit;

  const franchiseStandings = await getFranchiseStandings(season);
  cache.set(key, franchiseStandings, minutes(1));
  return franchiseStandings;
}

export async function getStandingsByCached(
  season: number,
  tier: Tier,
): Promise<Standing[]> {
  const key = `s${season}-${tier.toLocaleLowerCase()}-standing`;
  const hit = cache.get<Standing[]>(key);
  if (hit !== undefined) return hit;

  const standingByTier = await getStandingsByTier(season, tier);
  cache.set(key, standingByTier, minutes(1));
  return standingByTier;
}

export type TeamWithFranchise = Prisma.TeamsGetPayload<{
  include: {
    Franchise: {
      include: { Brand: true };
    };
  };
}>;

export async function getAllTeamsByTierCached(tier: Tier): Promise<TeamWithFranchise[]> {
  const key = `${tier}-teams`;
  const hit = cache.get<TeamWithFranchise[]>(key);
  if (hit !== undefined) return hit;

  const allTeamsByTier = await Team.getAllActiveByTier(tier);
  cache.set(key, allTeamsByTier, Times.DAY);
  return allTeamsByTier;
}

export async function getScheduleByTierCached(
  tier: Tier,
  season: number,
): Promise<Schedule> {
  const key = `s${season}-${tier}-schedule`;
  const hit = cache.get<Schedule>(key);
  if (hit !== undefined) return hit;

  const scheduleByTier = await getScheduleByTier(tier, season);
  cache.set(key, scheduleByTier, minutes(30));
  return scheduleByTier;
}

export type ActiveFranchise = Prisma.FranchiseGetPayload<{
  include: {
    Teams: true;
    Brand: true;
  };
}>;
type ActiveFranchises = ActiveFranchise[];
export async function getAllActiveFranchisesCached() {
  const key = "activeFranchises";
  const hit = cache.get<ActiveFranchises>(key);
  if (hit !== undefined) return hit;

  const activeFranchises = await Franchise.getAllActive();
  cache.set(key, activeFranchises, Times.DAY);
  return activeFranchises;
}

export type FranchiseDetails = Awaited<ReturnType<typeof getFranchiseDetails>>;

export async function getFranchiseDetailsBySlugCached(
  slug: string,
  season: number,
): Promise<FranchiseDetails> {
  const key = `s${season}-${slug}-franchise`;
  const hit = cache.get<FranchiseDetails>(key);
  if (hit !== undefined) return hit;

  const franchise = await getFranchiseDetails(slug, season);
  cache.set(key, franchise, minutes(5));
  return franchise;
}

export async function getTeamByIdCached(id: number) {
  const key = `team-${id}`;
  const hit = cache.get<string>(key);
  if (hit !== undefined) return hit;

  const team = await Team.getBy({ id: id });
  cache.set(key, team, Times.DAY);
  return team;
}

export async function getMmmrTierLinesCached() {
  const key = "mmrTierLines";
  const hit = cache.get<MmrTierLines>(key);
  if (hit !== undefined) return hit;

  const mmrTierLines = await getMMRTierLines();
  cache.set(key, mmrTierLines, Times.DAY);
  return mmrTierLines;
}

export async function getMatchNightRecapCached(
  season: number,
): Promise<MatchNightRecap | null> {
  const key = `s${season}-matchNightRecap`;
  const hit = cache.get<MatchNightRecap | null>(key);
  if (hit !== undefined) return hit;

  const recap = await getMatchNightRecap(season);
  cache.set(key, recap, minutes(30));
  return recap;
}
