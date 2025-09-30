import { hasAccess } from "@/lib/auth/access";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { Roles } from "@/prisma";

import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ message: "Unauthenticated." }, { status: 401 });
  }
  const userRoles = session.user?.roles || "";

  if (!hasAccess(userRoles, [Roles.ADMIN, Roles.LEAD_TECH])) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 403 });
  }

  const controlPanel = await prisma.controlPanel.findMany();
  const controlPanelMap = controlPanel.map((item) => ({
    label: item.name,
    value: item.value,
    notes: item.notes,
  }));

  
  return NextResponse.json({ controlPanelMap });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ message: "Unauthenticated." }, { status: 401 });
  }
  const userRoles = session.user?.roles || "";

  if (!hasAccess(userRoles, [Roles.ADMIN, Roles.LEAD_TECH])) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 403 });
  }

  const updates = await request.json();
  const ops = Object.entries(updates).map(([name, rawValue]) => {
    let value: string;
    if (Array.isArray(rawValue)) {
      value = rawValue.join(",");
    } else {
      value = String(rawValue);
    }
    return prisma.controlPanel.updateMany({
      where: {
        name: name,
      },
      data: {
        value: value,
      },
    });
  });

  try {
    await prisma.$transaction(ops);
      

    return NextResponse.json({
      message: `Control Panel values successfully updated.`,
    });
  } catch (e) {
    return NextResponse.json(
      { message: `Error updateing Control Panel Values: ${e}` },
      { status: 500 }
    );
  }
}
