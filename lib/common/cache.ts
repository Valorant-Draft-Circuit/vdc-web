import NodeCache from "node-cache";
import { ControlPanel, Franchise, Team } from "@/prisma";
import { FAQ, getFaq } from "../queries/about/faq";
import { minutes, Times } from "./times";
import { StandingProps } from "@/components/standings/StandingsCard";
import {
  getFranchiseStandings,
  getStandingsByTier,
} from "../queries/standings/standings";
import { Prisma, Tier } from "@prisma/client";
import { getScheduleByTier, Schedule } from "../queries/schedule/schedule";

let cache: NodeCache;

export function initCache() {
  if (!cache) {
    cache = new NodeCache({
      stdTTL: 0,
      checkperiod: minutes(10), // prune expired keys every 10 mins
    });
  }
}

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
  cache.set(key, franchiseStandings, Times.MINUTE);
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
  cache.set(key, standingByTier, Times.MINUTE);
  return standingByTier;
}

type TeamWithFranchiseAndBrand = Prisma.TeamsGetPayload<{
  include: {
    Franchise: {
      include: { Brand: true };
    };
  };
}>;

export async function getAllTeamsByTierCached(
  tier: Tier
): Promise<TeamWithFranchiseAndBrand[]> {
  const key = `${tier}-teams`;
  const hit = cache.get<TeamWithFranchiseAndBrand[]>(key);
  if (hit !== undefined) return hit;

  const allTeamsByTier = await Team.getAllActiveByTier(tier);
  cache.set(key, allTeamsByTier, Times.DAY);
  return allTeamsByTier;
}

export async function getScheduleByTierCached(
  tier: Tier,
  season: number
): Promise<Schedule> {
  const key = `${tier}-schedule`;
  const hit = cache.get<Schedule>(key);
  if (hit !== undefined) return hit;
  const scheduleByTier = getScheduleByTier(tier, season);
  cache.set(key, scheduleByTier, minutes(30));
  return scheduleByTier;
}

type ActiveFranchises = Prisma.FranchiseGetPayload<{
  include: {
    Teams: true;
    Brand: true;
  };
}>[];
export async function getAllActiveFranchisesCached() {
  const key = "activeFranchises";
  const hit = cache.get<ActiveFranchises>(key);
  if (hit !== undefined) return hit;

  const activeFranchises = await Franchise.getAllActive();
  cache.set(key, activeFranchises, Times.DAY);
  return activeFranchises;
}

export type FranchiseInfo = Prisma.FranchiseGetPayload<{
  include: {
    GM: {
      include: {
        Accounts: true;
      };
    };
    AGM1: {
      include: {
        Accounts: true;
      };
    };
    AGM2: {
      include: {
        Accounts: true;
      };
    };
    AGM3: {
      include: {
        Accounts: true;
      };
    };
    Brand: true;
    Teams: true;
  };
}>;

export async function getFranchiseBySlugCached(slug: string) {
  const key = `${slug}-franchise`;
  const hit = cache.get<FranchiseInfo>(key);
  if (hit !== undefined) return hit;

  const franchise = await Franchise.getBy({ slug: slug });
  cache.set(key, franchise, Times.DAY);
  return franchise;
}
