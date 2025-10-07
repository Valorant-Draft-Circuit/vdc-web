import { LeagueStatus } from "@prisma/client";

export function determineTeam(user) {
  const { leagueStatus, contractStatus } = user.Status;

  switch (leagueStatus) {
    case LeagueStatus.DRAFT_ELIGIBLE:
      return "DE";
    case LeagueStatus.FREE_AGENT:
      return "FA";
    case LeagueStatus.RESTRICTED_FREE_AGENT:
      return "RFA";
    case LeagueStatus.SUSPENDED:
    case LeagueStatus.UNREGISTERED:
    case LeagueStatus.PENDING:
      return leagueStatus;
    case LeagueStatus.GENERAL_MANAGER:
      return getManagementTitle(user, contractStatus);
    default:
      if (contractStatus === LeagueStatus.SIGNED) {
        return `${user.Team.Franchise.slug} | ${user.Team.name}`;
      }
      return null;
  }
}

function getManagementTitle(user, contractStatus) {
  if (contractStatus === LeagueStatus.SIGNED) {
    return `${user.Team.Franchise.slug} | ${user.Team.name}`;
  }
  return user.Team ? `${user.Team.Franchise.name}` : null;
}
