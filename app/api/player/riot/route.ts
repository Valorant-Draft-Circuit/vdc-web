import { auth } from "@/lib/auth/auth";
import { prisma } from "@/prisma/prismadb";
import { NextRequest, NextResponse } from "next/server";

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
  return NextResponse.json(playerRiotAccounts);
}

export async function POST(request: NextRequest) {
  const req = await request.json();

  if (req.method !== "POST") {
    return NextResponse.json({
      message: "Only POST requests allowed",
      status: 405,
    });
  }
  const body = req.body;
  if (body.job === "removeAccount") {
    await prisma.account.delete({
      where: {
        id: body.id,
      },
    });
    await prisma.$disconnect();
    return NextResponse.json({ message: `Successfully removed ${body.id}` });
  } else
    return NextResponse.json({
      message: `${req.job} is not a valid request!`,
      status: 400,
    });
}
