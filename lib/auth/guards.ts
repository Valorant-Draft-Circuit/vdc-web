import { cache } from "react";
import { auth } from "@/lib/auth/auth";
import { getUserRoles, hasAccess } from "@/lib/auth/access";

const getViewerRoles = cache(async (): Promise<string | null> => {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;
  const roles = await getUserRoles(userId);
  return roles || null;
});

/** Roles are read from the database on every request, never from the session token. */
export async function viewerHasAccess(
  requiredRoles: number[],
): Promise<boolean> {
  const roles = await getViewerRoles();
  return roles !== null && hasAccess(roles, requiredRoles);
}

/** For data-layer functions: layouts do not gate the pages and queries beneath them. */
export async function assertViewerAccess(
  requiredRoles: number[],
): Promise<void> {
  if (!(await viewerHasAccess(requiredRoles))) {
    throw new Error("Forbidden");
  }
}
