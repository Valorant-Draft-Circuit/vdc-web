"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth/auth";
import { getUserRoles, hasAccess } from "@/lib/auth/access";
import { prisma } from "@/lib/prisma";
import { Roles } from "@/prisma";

type UpdateResult = { ok: true } | { ok: false; error: string };

export async function updateControlPanelAction(
  updates: Record<string, string | string[]>,
): Promise<UpdateResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "Unauthenticated" };
  }

  const userRoles = await getUserRoles(session.user.id);
  if (!hasAccess(userRoles, [Roles.ADMIN, Roles.LEAD_TECH])) {
    return { ok: false, error: "Unauthorized" };
  }

  const ops = Object.entries(updates).map(([name, rawValue]) => {
    const value = Array.isArray(rawValue) ? rawValue.join(",") : String(rawValue);
    return prisma.controlPanel.updateMany({
      where: { name },
      data: { value },
    });
  });

  try {
    await prisma.$transaction(ops);
    revalidatePath("/staff/admin/control");
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: `Error updating Control Panel Values: ${e instanceof Error ? e.message : String(e)}`,
    };
  }
}
