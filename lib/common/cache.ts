import NodeCache from "node-cache";
import { ControlPanel, Franchise, Team } from "@/prisma";
// import { TFAQ, getFaq } from "../queries/about/faq";
import { minutes, Times } from "./times";
import { TStandingProps } from "@/components/standings/StandingsCard";
import {
  getFranchiseStandings,
  getStandingsByTier,
} from "../queries/standings/standings";
import { Prisma, Tier } from "@prisma/client";
import { getScheduleByTier, TSchedule } from "../queries/schedule/schedule";
import getFranchiseDetails from "../queries/franchises/franchises";
import { getAgents, getMaps, TAgents, TMaps } from "./valorant-api";
import { getMMRTierLines } from "./utils";

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

export async function getAgentsCached(): Promise<TAgents> {
  const key = "agents";
  const hit = cache.get<TAgents>(key);
  if (hit) return hit;

  const agents = await getAgents();
  cache.set(key, agents, Times.DAY);
  return agents;
}

export async function getMapsCached(): Promise<TMaps> {
  const key = "maps";
  const hit = cache.get<TMaps>(key);
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

// export async function getFaqCached(): Promise<TFAQ[]> {
//   const key = "faqs";
//   const hit = cache.get<TFAQ[]>(key);
//   if (hit) return hit;

//   const faqs = await getFaq();
//   cache.set(key, faqs, Times.DAY);
//   return faqs;
// }

export async function getFranchiseStandingsCached(
  season: number,
): Promise<TStandingProps[]> {
  const key = "franchiseStandings";
  const hit = cache.get<TStandingProps[]>(key);
  if (hit !== undefined) return hit;

  const franchiseStandings = await getFranchiseStandings(season);
  cache.set(key, franchiseStandings, minutes(1));
  return franchiseStandings;
}

export async function getStandingsByCached(
  season: number,
  tier: Tier,
): Promise<TStandingProps[]> {
  const key = `s${season}-${tier.toLocaleLowerCase()}-standing`;
  const hit = cache.get<TStandingProps[]>(key);
  if (hit !== undefined) return hit;

  const standingByTier = await getStandingsByTier(season, tier);
  cache.set(key, standingByTier, minutes(1));
  return standingByTier;
}

export type TTeam = Prisma.TeamsGetPayload<{
  include: {
    Franchise: {
      include: { Brand: true };
    };
  };
}>;

export async function getAllTeamsByTierCached(tier: Tier): Promise<TTeam[]> {
  const key = `${tier}-teams`;
  const hit = cache.get<TTeam[]>(key);
  if (hit !== undefined) return hit;

  const allTeamsByTier = await Team.getAllActiveByTier(tier);
  cache.set(key, allTeamsByTier, Times.DAY);
  return allTeamsByTier;
}

export async function getScheduleByTierCached(
  tier: Tier,
  season: number,
): Promise<TSchedule> {
  const key = `s${season}-${tier}-schedule`;
  const hit = cache.get<TSchedule>(key);
  if (hit !== undefined) return hit;

  const scheduleByTier = await getScheduleByTier(tier, season);
  cache.set(key, scheduleByTier, minutes(30));
  return scheduleByTier;
}

type TActiveFranchises = Prisma.FranchiseGetPayload<{
  include: {
    Teams: true;
    Brand: true;
  };
}>[];
export async function getAllActiveFranchisesCached() {
  const key = "activeFranchises";
  const hit = cache.get<TActiveFranchises>(key);
  if (hit !== undefined) return hit;

  const activeFranchises = await Franchise.getAllActive();
  cache.set(key, activeFranchises, Times.DAY);
  return activeFranchises;
}

export async function getFranchiseDetailsBySlugCached(
  slug: string,
  season: number,
) {
  const key = `s${season}-${slug}-franchise`;
  const hit = cache.get(key);
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

type TMmrTierLies = {
  RECRUIT: { min: number; max: number };
  PROSPECT: { min: number; max: number };
  APPRENTICE: { min: number; max: number };
  EXPERT: { min: number; max: number };
  MYTHIC: { min: number; max: number };
};

export async function getMmmrTierLinesCached() {
  const key = "mmrTierLines";
  const hit = cache.get<TMmrTierLies>(key);
  if (hit !== undefined) return hit;

  const mmrTierLines = await getMMRTierLines();
  cache.set(key, mmrTierLines, Times.DAY);
  return mmrTierLines;
}
