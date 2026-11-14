"use server";

import { revalidatePath } from "next/cache";
import { ModLogType } from "@prisma/client";

import { auth } from "@/lib/auth/auth";
import { getUserRoles, hasAccess } from "@/lib/auth/access";
import { prisma } from "@/lib/prisma";
import { MODERATION_ROLES } from "@/lib/common/constants/roles";
import {
  PICKEM_DELETION_PREFIX,
  appendActionedMarker,
  stripActionedMarker,
} from "@/lib/common/moderation";

type Result = { ok: true } | { ok: false; error: string };

const MAX_CHANGES_PER_SAVE = 200;

export async function saveDeletionQueue(
  changes: { logId: number; actioned: boolean }[],
): Promise<Result> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "Unauthenticated" };
  }

  const roles = await getUserRoles(session.user.id);
  if (!hasAccess(roles, MODERATION_ROLES)) {
    return { ok: false, error: "Not authorized" };
  }

  if (
    !Array.isArray(changes) ||
    changes.length > MAX_CHANGES_PER_SAVE ||
    !changes.every(
      (change) =>
        Number.isInteger(change?.logId) && typeof change.actioned === "boolean",
    )
  ) {
    return { ok: false, error: "Invalid request" };
  }

  const modName = session.user.name ?? session.user.id;
  for (const change of changes) {
    const log = await prisma.modLogs.findUnique({
      where: { id: change.logId },
    });
    if (
      !log ||
      log.type !== ModLogType.NOTE ||
      !log.message.startsWith(PICKEM_DELETION_PREFIX)
    ) {
      revalidatePath("/staff/moderation");
      return { ok: false, error: "Invalid log entry" };
    }

    const nextMessage = change.actioned
      ? appendActionedMarker(log.message, modName, new Date())
      : stripActionedMarker(log.message);
    if (nextMessage !== log.message) {
      await prisma.modLogs.update({
        where: { id: log.id },
        data: { message: nextMessage },
      });
    }
  }

  revalidatePath("/staff/moderation");
  return { ok: true };
}
