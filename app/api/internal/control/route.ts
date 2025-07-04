import { hasAccess } from "@/lib/auth/access";
import { auth } from "@/lib/auth/auth";
import { Roles } from "@/prisma";
import { prisma } from "@/prisma/prismadb";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({
      message: "Unauthenticated.",
      status: 401,
    });
  }
  const userRoles = session.user?.roles || "";

  if (!hasAccess(userRoles, [Roles.ADMIN, Roles.LEAD_TECH])) {
    return NextResponse.json({
      message: "Unauthorized.",
      status: 403,
    });
  }

  let controlPanel = await prisma.controlPanel.findMany();
  const controlPanelMap = controlPanel.map((item) => ({
    label: item.name,
    value: item.value,
    notes: item.notes,
  }));

  return NextResponse.json({ controlPanelMap });
}
