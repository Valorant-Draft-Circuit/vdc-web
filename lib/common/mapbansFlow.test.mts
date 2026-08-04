import assert from "node:assert/strict";
import { MapBanType } from "@prisma/client";
import {
  buildSkeletonRows,
  sideChooserFor,
  type VetoRow,
} from "./mapbansFlow.ts";

const HOME_TEAM_ID = 101;
const AWAY_TEAM_ID = 202;

const HOME_FIRST_ORDERS_WITH_DECIDER: Record<string, string[]> = {
  BO1: [
    "BAN_HOME",
    "BAN_AWAY",
    "BAN_HOME",
    "BAN_AWAY",
    "BAN_HOME",
    "BAN_AWAY",
    "DECIDER",
  ],
  BO3: [
    "BAN_HOME",
    "BAN_AWAY",
    "PICK_HOME",
    "PICK_AWAY",
    "BAN_HOME",
    "BAN_AWAY",
    "DECIDER",
  ],
  BO5: [
    "BAN_HOME",
    "BAN_AWAY",
    "PICK_HOME",
    "PICK_AWAY",
    "PICK_HOME",
    "PICK_AWAY",
    "DECIDER",
  ],
};

function toVetoRows(banOrder: string[]): VetoRow[] {
  return buildSkeletonRows(banOrder, HOME_TEAM_ID, AWAY_TEAM_ID).map(
    (skeletonRow, index) => ({
      id: index + 1,
      order: skeletonRow.order,
      type: skeletonRow.type,
      team: skeletonRow.team,
      map: null,
      side: null,
    }),
  );
}

function deciderRow(rows: VetoRow[]): VetoRow {
  const row = rows.find((candidate) => candidate.type === MapBanType.DECIDER);
  assert.ok(row, "expected a DECIDER row in the ban order");
  return row;
}

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

for (const [format, banOrder] of Object.entries(
  HOME_FIRST_ORDERS_WITH_DECIDER,
)) {
  test(
    `test_GIVEN_${format}_playoff_veto_WHEN_choosing_decider_side_THEN_home_higher_seed_chooses`,
    () => {
      const rows = toVetoRows(banOrder);
      const decider = deciderRow(rows);
      assert.equal(decider.team, null);
      assert.equal(sideChooserFor(decider, rows), HOME_TEAM_ID);
    },
  );
}

test(
  "test_GIVEN_decider_row_WHEN_away_team_acts_first_THEN_away_chooses_side",
  () => {
    const rows = toVetoRows([
      "BAN_AWAY",
      "BAN_HOME",
      "BAN_AWAY",
      "BAN_HOME",
      "BAN_AWAY",
      "BAN_HOME",
      "DECIDER",
    ]);
    const decider = deciderRow(rows);
    assert.equal(sideChooserFor(decider, rows), AWAY_TEAM_ID);
  },
);

if (failures > 0) {
  console.error(`\n${failures} test(s) failed`);
  process.exit(1);
}
console.log("\nAll mapbansFlow decider-side tests passed");
