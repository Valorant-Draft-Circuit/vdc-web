import { PrismaClient, MatchType, Tier } from "@prisma/client";

const prisma = new PrismaClient();

const SEASON = 9;
const TIERS: Tier[] = [
  Tier.MYTHIC,
  Tier.EXPERT,
  Tier.APPRENTICE,
  Tier.PROSPECT,
  Tier.RECRUIT,
];
const NUM_PLAYERS = 24;
const SLATE_PARTICIPATION = 0.8;
const MATCH_PICK_RATE = 0.85;

function legalScores(mt: MatchType) {
  if (mt === MatchType.BO5)
    return [
      [3, 0],
      [3, 1],
      [3, 2],
      [2, 3],
      [1, 3],
      [0, 3],
    ];
  if (mt === MatchType.BO3)
    return [
      [2, 0],
      [2, 1],
      [1, 2],
      [0, 2],
    ];
  return [
    [2, 0],
    [1, 1],
    [0, 2],
  ];
}
const rnd = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

async function seedTier(tier: Tier, userIds: string[]) {
  const matches = await prisma.matches.findMany({
    where: {
      season: SEASON,
      tier,
      matchType: { in: [MatchType.BO2, MatchType.PRE_SEASON] },
      matchDay: { not: null },
    },
    select: {
      matchID: true,
      matchType: true,
      matchDay: true,
      home: true,
      away: true,
    },
  });
  if (matches.length === 0) {
    console.log(`no matches for ${tier} S${SEASON}`);
    return;
  }

  const byDay = new Map<number, typeof matches>();
  for (const m of matches) {
    const d = m.matchDay as number;
    if (!byDay.has(d)) byDay.set(d, []);
    byDay.get(d)!.push(m);
  }

  const teamIds = [
    ...new Set(
      matches
        .flatMap((m) => [m.home, m.away])
        .filter((x): x is number => x !== null),
    ),
  ];
  const n = teamIds.length >= 12 ? 8 : teamIds.length >= 8 ? 6 : 4;

  for (const userID of userIds) {
    for (const [, dayMatches] of byDay) {
      if (Math.random() > SLATE_PARTICIPATION) continue;
      for (const m of dayMatches) {
        if (Math.random() > MATCH_PICK_RATE) continue;
        const [home, away] = rnd(legalScores(m.matchType));
        await prisma.pickemMatchPick.upsert({
          where: { userID_matchID: { userID, matchID: m.matchID } },
          create: {
            userID,
            matchID: m.matchID,
            predictedHomeScore: home,
            predictedAwayScore: away,
          },
          update: { predictedHomeScore: home, predictedAwayScore: away },
        });
      }
    }
    const shuffled = [...teamIds].sort(() => Math.random() - 0.5).slice(0, n);
    await prisma.pickemAdvancePick.deleteMany({
      where: { userID, season: SEASON, tier },
    });
    await prisma.pickemAdvancePick.createMany({
      data: shuffled.map((team, i) => ({
        userID,
        season: SEASON,
        tier,
        predictedTeam: team,
        predictedSeed: i + 1,
      })),
    });
  }
  console.log(
    `seeded ${tier}: ${userIds.length} players over ${matches.length} matches`,
  );
}

async function main() {
  const users = await prisma.user.findMany({
    where: { name: { not: null } },
    take: NUM_PLAYERS,
    select: { id: true },
  });
  const userIds = users.map((u) => u.id);
  if (userIds.length === 0) throw new Error("no users to seed picks for");

  for (const tier of TIERS) await seedTier(tier, userIds);

  await prisma.pickemGroup.deleteMany({
    where: { joinCode: { in: ["TESTAAAA", "TESTBBBB"] } },
  });
  await prisma.pickemGroup.create({
    data: {
      name: "Test League",
      image: "add6443a-41bd-e414-f6ad-e58d267f4e95",
      season: SEASON,
      ownerID: userIds[0],
      joinCode: "TESTAAAA",
      Members: { create: userIds.slice(0, 12).map((userID) => ({ userID })) },
    },
  });
  await prisma.pickemGroup.create({
    data: {
      name: "Office Pool",
      image: "add6443a-41bd-e414-f6ad-e58d267f4e95",
      season: SEASON,
      ownerID: userIds[1],
      joinCode: "TESTBBBB",
      Members: { create: userIds.slice(6, 24).map((userID) => ({ userID })) },
    },
  });
  console.log("seeded groups: Test League (TESTAAAA), Office Pool (TESTBBBB)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
