import { PrismaClient, TransactionType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const franchises = await prisma.franchise.findMany({
    take: 2,
    select: { id: true, name: true },
  });
  if (franchises.length < 2) {
    throw new Error("Need two franchises to build a realistic payload");
  }
  const player = await prisma.account.findFirst({
    where: { provider: "riot", riotIGN: { not: null } },
    select: { riotIGN: true },
  });
  const ign = player?.riotIGN ?? "OceanMan#NA1";

  const good = JSON.stringify({
    franchise1: { id: franchises[0].id, name: franchises[0].name },
    franchise2: { id: franchises[1].id, name: franchises[1].name },
    f1Gives: [
      `\`U\` | [\`${ign}\`](https://tracker.gg/valorant/profile/riot/x) - Test`,
      "`P` | `MYTHIC` - Round 2, Pick 4, (14)",
    ],
    f2Gives: ["`P` | `EXPERT` - Round 1, Pick 3, (3)"],
  });

  const season = 10;
  const payloads = [good, null, "garbage {{{"];
  const ids: number[] = [];
  for (const details of payloads) {
    const row = await prisma.transaction.create({
      data: { type: TransactionType.TRADE, season, details },
      select: { id: true },
    });
    ids.push(row.id);
  }
  console.log("seeded ids:", ids.join(","));
  console.log("franchises:", franchises.map((f) => f.name).join(" / "));
  console.log("player ign:", ign);
  await prisma.$disconnect();
}

main();
