import { auth } from "@/lib/auth/auth";
import { prisma } from "@/prisma/prismadb";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({
      message: "Unauthenticated.",
      status: 401,
    });
  }

  const userId = session.user?.id;
  const playerRiotAccounts = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      primaryRiotAccountID: true,
      Accounts: {
        where: {
          provider: "riot",
        },
        select: {
          providerAccountId: true,
          riotIGN: true,
        },
      },
    },
  });
  await prisma.$disconnect();
  console.log(playerRiotAccounts);
  return NextResponse.json(playerRiotAccounts);
}
