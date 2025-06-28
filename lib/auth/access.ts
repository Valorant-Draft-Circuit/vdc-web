import { Roles } from "@/prisma";
import { SUPERUSER_ROLES } from "../common/constants";

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
    (role) => (BigInt(userRoleValue) & BigInt(role)) !== BigInt(0)
  );
}


export function hasAccessToLink(
  userRoleValue: string,
  requiredRoles: number[]
): boolean {
  const userRolesBigInt = BigInt(userRoleValue);

  const isSuperUser = SUPERUSER_ROLES.some(
    (role) => (userRolesBigInt & BigInt(role)) !== BigInt(0)
  );
  if (isSuperUser) return true;

  return requiredRoles.some(
    (role) => (userRolesBigInt & BigInt(role)) !== BigInt(0)
  );
}
