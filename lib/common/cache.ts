import NodeCache from "node-cache";
import { ControlPanel, Team } from "@/prisma";
import { FAQ, getFaq } from "../queries/about/faq";
import { minutes, Times } from "./times";
import { StandingProps } from "@/components/standings/StandingsCard";
import {
  getFranchiseStandings,
  getStandingsByTier,
} from "../queries/standings/standings";
import { Tier } from "@prisma/client";

const cache = new NodeCache({
  stdTTL: 0,
  checkperiod: minutes(10), // prune expired keys every 10 mins
});

export async function getSeasonCached(): Promise<number> {
  const key = "currentSeason";
  const hit = cache.get<number>(key);
  if (hit !== undefined) return hit;

  const season = await ControlPanel.getSeason();
  cache.set(key, season, Times.DAY);
  return season;
}

export async function getFaqCached(): Promise<FAQ[]> {
  const key = "faqs";
  const hit = cache.get<FAQ[]>(key);
  if (hit !== undefined) return hit;

  const faqs = await getFaq();
  cache.set(key, faqs, Times.DAY);
  return faqs;
}

export async function getFranchiseStandingsCached(
  season: number
): Promise<StandingProps[]> {
  const key = "franchiseStandings";
  const hit = cache.get<StandingProps[]>(key);
  if (hit !== undefined) return hit;

  const franchiseStandings = await getFranchiseStandings(season);
  cache.set(key, franchiseStandings, minutes(5));
  return franchiseStandings;
}

export async function getStandingsByCached(
  season: number,
  tier: Tier
): Promise<StandingProps[]> {
  const key = `s${season}-${tier}-standing`;
  const hit = cache.get<StandingProps[]>(key);
  if (hit !== undefined) return hit;

  const standingByTier = await getStandingsByTier(season, tier);
  cache.set(key, standingByTier, minutes(5));
  return standingByTier;
}

export async function getAllTeamsByTierCached(tier: Tier): Promise<any[]> {
  const key = `${tier}-teams`;
  const hit = cache.get<any[]>(key);
  if (hit !== undefined) return hit;

  const allTeamsByTier = await Team.getAllActiveByTier(tier);
  cache.set(key, allTeamsByTier, Times.DAY);
  return allTeamsByTier;
}
