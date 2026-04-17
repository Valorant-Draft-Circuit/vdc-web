import { Roles } from "@/prisma";
import { SUPERUSER_ROLES } from "../common/constants";
import { prisma } from "@/prisma/prismadb";

export function isAuthorizedForMeilisearch(roleValue): boolean {
  const TECH_ROLES = Roles.TECH_DB | Roles.LEAD_TECH | Roles.OWNER;
  return (BigInt(roleValue) & BigInt(TECH_ROLES)) !== BigInt(0);
}

export function isExecutiveUser(roleValue) {
  const ROLES = Roles.ADMIN | Roles.OWNER;
  return (BigInt(roleValue) & BigInt(ROLES)) !== BigInt(0);
}

export function hasAnyRole(userRoleValue, requiredRoles: number[]) {
  return requiredRoles.some(
    (role) => (BigInt(userRoleValue) & BigInt(role)) !== BigInt(0),
  );
}

export function hasAccess(
  userRoleValue: string,
  requiredRoles: number[],
): boolean {
  const userRolesBigInt = BigInt(userRoleValue);

  const isSuperUser = SUPERUSER_ROLES.some(
    (role) => (userRolesBigInt & BigInt(role)) !== BigInt(0),
  );
  if (isSuperUser) return true;

  return requiredRoles.some(
    (role) => (userRolesBigInt & BigInt(role)) !== BigInt(0),
  );
}

export async function getUserRoles(userId: string) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      roles: true,
    },
  });
  return user?.roles ?? "";
}
