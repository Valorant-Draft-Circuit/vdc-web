import { ContractStatus, LeagueStatus } from "@prisma/client";
import { Roles } from "@/prisma";

export function getUserStatus(user) {
  /**
   * Requirements:
   * return registration status first and foremost
   * if theyre on a team and are management display SLUG MANAGEMENT TYPE | TEAM
   * if theyre on a team and not management display SLUG | TEAM
   * if theyre free agent/de, return that
   * if theyre not rostered, but are AGM/GM, return SLUG MANAGEMENT
   * if theyre any other status, display that
   * if unregistered, check for their roles
   * if not elevated, return unregistered
   * if elevated, return elevated role
   */

  const { leagueStatus, contractStatus } = user.Status;
  const userRole = BigInt(user.roles);

  const registrationStatuses = [
    LeagueStatus.SUSPENDED,
    LeagueStatus.PENDING,
    LeagueStatus.APPROVED,
    LeagueStatus.MANUAL_REVIEW,
  ];
  if (registrationStatuses.includes(leagueStatus)) {
    return leagueStatus === LeagueStatus.MANUAL_REVIEW
      ? "MANUAL REVIEW"
      : leagueStatus;
  }
  if (contractStatus) {
    const { Franchise, name } = user.Team;
    if (contractStatus === ContractStatus.SIGNED) {
      if (leagueStatus === LeagueStatus.SIGNED) {
        return `${Franchise.slug} | ${name}`;
      } else if (leagueStatus === LeagueStatus.GENERAL_MANAGER) {
        return `${Franchise.slug} ${getManagementTitle(userRole)} | ${name}`;
      }
    } else if (contractStatus === ContractStatus.ACTIVE_SUB) {
      return `${Franchise.slug} ${name} SUBSTITUTE`;
    } else if (contractStatus === ContractStatus.INACTIVE_RESERVE) {
      return `${Franchise.slug} ${name} `;
    }
  }

  const statusShorthands = {
    [LeagueStatus.DRAFT_ELIGIBLE]: "DE",
    [LeagueStatus.FREE_AGENT]: "FA",
    [LeagueStatus.RESTRICTED_FREE_AGENT]: "RFA",
  };
  if (statusShorthands[leagueStatus]) {
    return statusShorthands[leagueStatus];
  }

  const exceptionStatuses = [LeagueStatus.RETIRED, LeagueStatus.SUSPENDED];
  if (exceptionStatuses.includes(leagueStatus)) {
    return leagueStatus;
  }

  if (leagueStatus === LeagueStatus.UNREGISTERED) {
    if (hasElevatedRole(userRole)) {
      return getElevatedTitle(userRole);
    } else if (isFranchiseManagement(userRole)) {
      return null;
    }
    return leagueStatus;
  }

  return "PLEASE CONTACT TECH";
}

function hasElevatedRole(userRole: bigint) {
  const elevatedRoles = BigInt(Roles.OWNER) | BigInt(Roles.ADMIN);
  return (userRole & elevatedRoles) !== 0n;
}

function getElevatedTitle(userRole: bigint) {
  if ((userRole & BigInt(Roles.OWNER)) !== 0n) {
    return "OWNER";
  } else if ((userRole & BigInt(Roles.ADMIN)) !== 0n) {
    return "ADMIN";
  }
  return null;
}

function isFranchiseManagement(userRole: bigint) {
  const fmRoles = BigInt(Roles.LEAGUE_GM) | BigInt(Roles.LEAGUE_AGM);
  return (userRole & fmRoles) !== 0n;
}

export function getManagementTitle(userRole: bigint) {
  if ((userRole & BigInt(Roles.LEAGUE_AGM)) !== 0n) {
    return "ASSISTANT GENERAL MANAGER";
  }
  return "GENERAL MANAGER";
}
