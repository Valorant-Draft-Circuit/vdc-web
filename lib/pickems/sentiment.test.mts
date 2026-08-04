import assert from "node:assert/strict";
import {
  tallyMatchup,
  findMatchUpsets,
  tallyAdvancement,
  tallyBracketSlots,
} from "./sentiment.ts";

let failures = 0;
function test(name: string, run: () => void) {
  try {
    run();
    console.log(`  PASS  ${name}`);
  } catch (error) {
    failures += 1;
    console.error(`  FAIL  ${name}`);
    console.error(error instanceof Error ? error.message : error);
  }
}

test(
  "test_GIVEN_lopsided_match_picks_WHEN_tallied_THEN_home_consensus_and_top_scoreline",
  () => {
    const picks = [
      { home: 2, away: 0 },
      { home: 2, away: 0 },
      { home: 2, away: 0 },
      { home: 1, away: 1 },
      { home: 0, away: 2 },
    ];
    const s = tallyMatchup(7, picks);
    assert.equal(s.totalPicks, 5);
    assert.equal(s.consensus, "HOME");
    assert.equal(s.consensusShare, 3 / 5);
    assert.equal(s.topScoreline, "2-0");
    assert.equal(s.counts.draw, 1);
  },
);

test(
  "test_GIVEN_consensus_contradicted_by_result_WHEN_findUpsets_THEN_ranked_by_wrong_consensus_share",
  () => {
    const strong = tallyMatchup(1, [
      { home: 2, away: 0 },
      { home: 2, away: 0 },
      { home: 2, away: 0 },
      { home: 2, away: 0 },
    ]);
    const mild = tallyMatchup(2, [
      { home: 2, away: 0 },
      { home: 2, away: 0 },
      { home: 0, away: 2 },
    ]);
    const upsets = findMatchUpsets([
      { sentiment: strong, result: { resolved: true, homeScore: 0, awayScore: 2, outcome: "AWAY" } },
      { sentiment: mild, result: { resolved: true, homeScore: 0, awayScore: 2, outcome: "AWAY" } },
    ]);
    assert.equal(upsets.length, 2);
    assert.equal(upsets[0].matchId, 1);
    assert.equal(upsets[1].matchId, 2);
  },
);

test(
  "test_GIVEN_advance_picks_WHEN_tallied_THEN_share_over_voters_and_modal_seed",
  () => {
    const byUser = new Map([
      ["u1", [{ teamId: 10, seed: 1 }, { teamId: 20, seed: 2 }]],
      ["u2", [{ teamId: 10, seed: 1 }, { teamId: 30, seed: 3 }]],
    ]);
    const { rows, voters } = tallyAdvancement(byUser);
    assert.equal(voters, 2);
    assert.equal(rows[0].teamId, 10);
    assert.equal(rows[0].share, 1);
    assert.equal(rows[0].consensusSeed, 1);
  },
);

test(
  "test_GIVEN_bracket_picks_WHEN_tallied_THEN_per_slot_top_team_and_share",
  () => {
    const picks = [
      { round: 0, slot: 0, teamId: 5 },
      { round: 0, slot: 0, teamId: 5 },
      { round: 0, slot: 0, teamId: 9 },
    ];
    const slots = tallyBracketSlots(picks);
    assert.equal(slots.length, 1);
    assert.equal(slots[0].teamId, 5);
    assert.equal(slots[0].total, 3);
    assert.equal(slots[0].share, 2 / 3);
  },
);

test(
  "test_GIVEN_tied_outcomes_WHEN_tallied_THEN_home_wins_tie_and_scoreline_is_lexicographically_smallest",
  () => {
    const s = tallyMatchup(3, [
      { home: 2, away: 0 },
      { home: 0, away: 2 },
    ]);
    assert.equal(s.consensus, "HOME");
    assert.equal(s.consensusShare, 0.5);
    assert.equal(s.topScoreline, "0-2");
  },
);

test(
  "test_GIVEN_no_picks_WHEN_tallied_THEN_zero_shares_and_empty_scoreline",
  () => {
    const s = tallyMatchup(4, []);
    assert.equal(s.totalPicks, 0);
    assert.equal(s.shares.home, 0);
    assert.equal(s.consensus, "HOME");
    assert.equal(s.consensusShare, 0);
    assert.equal(s.topScoreline, "");
    const advance = tallyAdvancement(new Map());
    assert.equal(advance.voters, 0);
    assert.equal(advance.rows.length, 0);
  },
);

if (failures > 0) {
  console.error(`\n${failures} test(s) failed`);
  process.exit(1);
}
console.log("\nAll sentiment tests passed");
