import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { ControlPanel } from "@/prisma";
import { ControlPanelID } from "@/prisma/enums/_controlpanel";
import { MatchType, Tier, VetoSource } from "@prisma/client";
import { deriveVetoState, VetoPhase } from "@/lib/common/mapbansFlow";

const VETO_MATCH_TYPES: MatchType[] = [
  MatchType.BO2,
  MatchType.BO3,
  MatchType.BO5,
];

// Staff force-start also covers matches whose scheduled time slipped past
// without a veto, so the list reaches a few days into the past.
const STARTABLE_LOOKBACK_DAYS = 3;
const STARTABLE_WINDOW_START = () =>
  new Date(Date.now() - STARTABLE_LOOKBACK_DAYS * 24 * 60 * 60 * 1000);

export type WebMapbanVeto = {
  matchID: number;
  tier: Tier;
  matchDay: number | null;
  homeName: string;
  awayName: string;
  dateScheduled: Date;
  source: VetoSource;
  phase: VetoPhase;
  filledSteps: number;
  totalSteps: number;
  isPastScheduled: boolean;
};

export type WebMapbanFlags = {
  enabled: string;
  staffOnly: string;
  pagerMinutes: string;
};

export type VetoSourceMetrics = {
  liveCount: number;
  stuckCount: number;
  completedCount: number;
  totalCount: number;
  openVetos: WebMapbanVeto[];
};

export type StartableMatch = {
  matchID: number;
  tier: Tier;
  matchDay: number | null;
  homeName: string;
  awayName: string;
  dateScheduled: Date;
};

export type WebMapbanMetrics = {
  web: VetoSourceMetrics;
  bot: VetoSourceMetrics;
  unstartedUpcomingCount: number;
  startableMatches: StartableMatch[];
  flags: WebMapbanFlags;
};

export const getWebMapbanMetrics = cache(
  async (season: number): Promise<WebMapbanMetrics> => {
    const [rows, mapPoolStr, controlRows, upcomingMatches] = await Promise.all([
      prisma.mapBans.findMany({
        where: { Match: { season } },
        orderBy: { order: "asc" },
        include: {
          Match: {
            select: {
              matchID: true,
              tier: true,
              matchDay: true,
              dateScheduled: true,
              Home: { select: { name: true } },
              Away: { select: { name: true } },
            },
          },
        },
      }),
      ControlPanel.getMapPool(),
      prisma.controlPanel.findMany({
        where: {
          id: {
            in: [
              ControlPanelID.WEB_MAPBANS_ENABLED,
              ControlPanelID.WEB_MAPBANS_STAFF_ONLY,
              ControlPanelID.WEB_MAPBANS_PAGER_MINUTES,
            ],
          },
        },
        select: { id: true, value: true },
      }),
      prisma.matches.findMany({
        where: {
          season,
          dateScheduled: { gte: STARTABLE_WINDOW_START() },
          matchType: { in: VETO_MATCH_TYPES },
          home: { not: null },
          away: { not: null },
          MapBans: { none: {} },
        },
        orderBy: { dateScheduled: "asc" },
        select: {
          matchID: true,
          tier: true,
          matchDay: true,
          dateScheduled: true,
          Home: { select: { name: true } },
          Away: { select: { name: true } },
        },
      }),
    ]);

    const mapPool = mapPoolStr.split(",");
    const rowsByMatch = new Map<number, typeof rows>();
    for (const row of rows) {
      const group = rowsByMatch.get(row.matchID) ?? [];
      group.push(row);
      rowsByMatch.set(row.matchID, group);
    }

    const now = Date.now();
    const emptyMetrics = (): VetoSourceMetrics => ({
      liveCount: 0,
      stuckCount: 0,
      completedCount: 0,
      totalCount: 0,
      openVetos: [],
    });
    const web = emptyMetrics();
    const bot = emptyMetrics();

    for (const [matchID, matchRows] of rowsByMatch) {
      const state = deriveVetoState(matchRows, mapPool);
      const match = matchRows[0].Match;
      const source = matchRows.some((row) => row.source === VetoSource.WEB)
        ? VetoSource.WEB
        : VetoSource.BOT;
      const metrics = source === VetoSource.WEB ? web : bot;

      metrics.totalCount += 1;

      if (state.phase === "complete") {
        metrics.completedCount += 1;
        continue;
      }

      const isPastScheduled = match.dateScheduled.getTime() < now;
      if (isPastScheduled) metrics.stuckCount += 1;
      else metrics.liveCount += 1;

      metrics.openVetos.push({
        matchID,
        tier: match.tier,
        matchDay: match.matchDay,
        homeName: match.Home?.name ?? "TBD",
        awayName: match.Away?.name ?? "TBD",
        dateScheduled: match.dateScheduled,
        source,
        phase: state.phase,
        filledSteps: matchRows.filter((row) => row.map !== null).length,
        totalSteps: matchRows.length,
        isPastScheduled,
      });
    }

    const byScheduledDate = (a: WebMapbanVeto, b: WebMapbanVeto) =>
      a.dateScheduled.getTime() - b.dateScheduled.getTime();
    web.openVetos.sort(byScheduledDate);
    bot.openVetos.sort(byScheduledDate);

    const controlValue = (id: number) =>
      controlRows.find((row) => row.id === id)?.value ?? "";

    const startableMatches: StartableMatch[] = upcomingMatches.map((match) => ({
      matchID: match.matchID,
      tier: match.tier,
      matchDay: match.matchDay,
      homeName: match.Home?.name ?? "TBD",
      awayName: match.Away?.name ?? "TBD",
      dateScheduled: match.dateScheduled,
    }));

    return {
      web,
      bot,
      unstartedUpcomingCount: startableMatches.length,
      startableMatches,
      flags: {
        enabled: controlValue(ControlPanelID.WEB_MAPBANS_ENABLED),
        staffOnly: controlValue(ControlPanelID.WEB_MAPBANS_STAFF_ONLY),
        pagerMinutes: controlValue(ControlPanelID.WEB_MAPBANS_PAGER_MINUTES),
      },
    };
  },
);
