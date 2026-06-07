"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth/auth";
import { getUserRoles, hasAccess } from "@/lib/auth/access";
import { Player, Roles } from "@/prisma";

type UpdateResult = { ok: true } | { ok: false; error: string };

export async function updateRolesAction(
  vdcId: string,
  roles: string[],
): Promise<UpdateResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "Unauthenticated" };
  }

  const userRoles = await getUserRoles(session.user.id);
  if (!hasAccess(userRoles, [Roles.LEAD_TECH])) {
    return { ok: false, error: "Unauthorized" };
  }

  const bigintRoles = roles.map((val) => BigInt(val));
  try {
    await Player.modifyRoles(
      { userID: vdcId },
      "SET",
      bigintRoles as unknown as Roles[],
    );
    revalidatePath(`/staff/tech/manage-roles/${vdcId}`);
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}
