import { Roles } from "@/prisma";

export function isAuthorizedForMeilisearch(roleValue): boolean {
  const TECH_ROLES = Roles.TECH_DB | Roles.LEAD_TECH;
  return (BigInt(roleValue) & BigInt(TECH_ROLES)) !== BigInt(0);
}
