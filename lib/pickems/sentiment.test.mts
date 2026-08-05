import assert from "node:assert/strict";
import {
  findMatchUpsets,
  findMatchChalk,
  findMissedCut,
  findSurpriseAdvancers,
  type AdvanceSentimentRow,
  type MatchupSentiment,
} from "./sentiment.ts";
import type { ResolvedMatch } from "./resolve.ts";

function sentiment(
  matchId: number,
  consensus: MatchupSentiment["consensus"],
  consensusShare: number,
): MatchupSentiment {
  return {
    matchId,
    totalPicks: 10,
    counts: { home: 0, draw: 0, away: 0 },
    shares: { home: 0, draw: 0, away: 0 },
    consensus,
    consensusShare,
    topScoreline: "",
  };
}

function resolved(outcome: ResolvedMatch["outcome"]): ResolvedMatch {
  return { resolved: true, homeScore: 0, awayScore: 0, outcome };
}

function advanceRow(
  teamId: number,
  share: number,
): AdvanceSentimentRow {
  return { teamId, count: Math.round(share * 10), share, consensusSeed: 0 };
}

function test_GIVEN_crowd_wrong_WHEN_findMatchChalk_THEN_excludes_upsets() {
  const entries = [
    { sentiment: sentiment(1, "HOME", 0.8), result: resolved("AWAY") },
    { sentiment: sentiment(2, "HOME", 0.6), result: resolved("HOME") },
  ];
  const chalk = findMatchChalk(entries);
  assert.deepEqual(
    chalk.map((c) => c.matchId),
    [2],
  );
}

function test_GIVEN_multiple_correct_WHEN_findMatchChalk_THEN_sorted_by_share_desc() {
  const entries = [
    { sentiment: sentiment(1, "HOME", 0.55), result: resolved("HOME") },
    { sentiment: sentiment(2, "AWAY", 0.9), result: resolved("AWAY") },
    { sentiment: sentiment(3, "HOME", 0.7), result: resolved("HOME") },
  ];
  const chalk = findMatchChalk(entries);
  assert.deepEqual(
    chalk.map((c) => c.matchId),
    [2, 3, 1],
  );
}

function test_GIVEN_unresolved_WHEN_findMatchChalk_THEN_skipped() {
  const entries = [
    {
      sentiment: sentiment(1, "HOME", 0.9),
      result: {
        resolved: false,
        homeScore: 0,
        awayScore: 0,
        outcome: null,
      } as ResolvedMatch,
    },
  ];
  assert.equal(findMatchChalk(entries).length, 0);
  assert.equal(findMatchUpsets(entries).length, 0);
}

function test_GIVEN_advanced_team_absent_from_picks_WHEN_findSurpriseAdvancers_THEN_treated_as_zero_share() {
  const rows = [advanceRow(1, 0.9), advanceRow(2, 0.4)];
  const advancedIds = new Set([2, 3]);
  const surprises = findSurpriseAdvancers(rows, advancedIds);
  assert.deepEqual(
    surprises.map((s) => s.teamId),
    [3, 2],
  );
  assert.equal(surprises[0].share, 0);
}

function test_GIVEN_favored_team_advanced_WHEN_findSurpriseAdvancers_THEN_excluded() {
  const rows = [advanceRow(1, 0.9)];
  const advancedIds = new Set([1]);
  assert.equal(findSurpriseAdvancers(rows, advancedIds).length, 0);
}

function test_GIVEN_advanced_teams_WHEN_findMissedCut_THEN_only_non_advancers() {
  const rows = [advanceRow(1, 0.9), advanceRow(2, 0.7), advanceRow(3, 0.3)];
  const advancedIds = new Set([1]);
  const missed = findMissedCut(rows, advancedIds);
  assert.deepEqual(
    missed.map((m) => m.teamId),
    [2, 3],
  );
}

const tests = [
  test_GIVEN_crowd_wrong_WHEN_findMatchChalk_THEN_excludes_upsets,
  test_GIVEN_multiple_correct_WHEN_findMatchChalk_THEN_sorted_by_share_desc,
  test_GIVEN_unresolved_WHEN_findMatchChalk_THEN_skipped,
  test_GIVEN_advanced_team_absent_from_picks_WHEN_findSurpriseAdvancers_THEN_treated_as_zero_share,
  test_GIVEN_favored_team_advanced_WHEN_findSurpriseAdvancers_THEN_excluded,
  test_GIVEN_advanced_teams_WHEN_findMissedCut_THEN_only_non_advancers,
];

for (const test of tests) {
  test();
  console.log(`ok - ${test.name}`);
}
console.log(`\n${tests.length} passed`);
