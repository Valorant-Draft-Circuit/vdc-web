import { prisma } from "@/prisma/prismadb";
import { GameType, MatchType } from "@prisma/client";

export default async function getFranchiseDetails(slug, season) {
  const franchise = await getFranchise(slug);
  const playerStats = await getPlayerStats(franchise, season);
  const futureGames = await getFutureGames(franchise, season);
  const pastGames = await getPastGames(franchise, season);
  franchise!.Teams = franchise!.Teams.map((team) => {
    team.Roster = team.Roster.map((player) => {
      const stats = playerStats.find((s) => s.userID === player.id);

      const enrichedStats = stats
        ? {
            matchesPlayed: stats._count.userID,
            acs: stats._avg.acs,
            attackRating: stats._avg.ratingAttack,
            defenseRating: stats._avg.ratingDefense,
            totalKills: stats._sum.kills,
            totalDeaths: stats._sum.deaths,
            totalAssists: stats._sum.assists,
            totalPlants: stats._sum.plants,
            totalDefuses: stats._sum.defuses,
            totalEcoKills: stats._sum.ecoKills,
            totalAntiecoKills: stats._sum.antiEcoKills,
            totalTradeKills: stats._sum.tradeKills,
            totalTradeDeaths: stats._sum.tradeDeaths,
            totalClutches: stats._sum.clutches,
            kast: stats._avg.kast,
            firstKills: stats._sum.firstKills,
            firstDeaths: stats._sum.firstDeaths,
            hs: stats._avg.hsPercent,
          }
        : null;

      return {
        ...player,
        riotName: player.PrimaryRiotAccount?.riotIGN ?? null,
        enrichedStats,
      };
    });

    const futureTeamGames = futureGames
      .map((game) => {
        if (game.home === team.id || game.away === team.id) return game;
      })
      .filter((game) => game !== undefined);
    const pastTeamGames = pastGames
      .map((game) => {
        if (game.home === team.id || game.away === team.id) {
          let homeWins = 0;
          let awayWins = 0;
          game.Games.map((map) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            map.winner === game.home ? homeWins++ : awayWins++;
          });
          return { ...game, homeWins: homeWins, awayWins: awayWins };
        }
      })
      .filter((game) => game !== undefined);
    return { ...team, futureGames: futureTeamGames, pastGames: pastTeamGames };
  });
  await prisma.$disconnect();
  return franchise;
}

async function getFranchise(slug) {
  return await prisma.franchise.findFirst({
    where: {
      slug: slug,
    },
    include: {
      Teams: {
        where: {
          active: true,
        },
        include: {
          Roster: {
            include: {
              PrimaryRiotAccount: true,
              Accounts: true,
              Captain: true,
            },
          },
        },
      },
      Brand: true,
      GM: true,
      AGM1: true,
      AGM2: true,
      AGM3: true,
    },
  });
}

async function getPlayerStats(franchise, season) {
  return await prisma.playerStats.groupBy({
    where: {
      Game: {
        season: season,
        gameType: GameType.SEASON,
      },
      Team: {
        franchise: franchise.id,
      },
    },
    by: ["userID"],
    _sum: {
      kills: true,
      deaths: true,
      assists: true,
      plants: true,
      defuses: true,
      firstKills: true,
      firstDeaths: true,
      tradeKills: true,
      tradeDeaths: true,
      ecoKills: true,
      antiEcoKills: true,
      ecoDeaths: true,
      exitKills: true,
      clutches: true,
    },
    _avg: {
      acs: true,
      ratingAttack: true,
      ratingDefense: true,
      kast: true,
      kills: true,
      assists: true,
      firstKills: true,
      firstDeaths: true,
      hsPercent: true,
    },
    _count: {
      userID: true,
    },
  });
}

async function getFutureGames(franchise, season: number) {
  return await prisma.matches.findMany({
    where: {
      season: season,
      OR: [
        {
          Home: {
            franchise: franchise.id,
          },
        },
        {
          Away: {
            franchise: franchise.id,
          },
        },
      ],
      dateScheduled: {
        gte: new Date(),
      },
    },
    include: {
      Home: {
        include: {
          Franchise: {
            select: {
              Brand: {
                select: {
                  logo: true,
                },
              },
            },
          },
        },
      },
      Away: {
        include: {
          Franchise: {
            select: {
              Brand: {
                select: {
                  logo: true,
                },
              },
            },
          },
        },
      },
    },
  });
}

async function getPastGames(franchise, season) {
  return await prisma.matches.findMany({
    where: {
      OR: [
        {
          Home: {
            franchise: franchise.id,
          },
        },
        {
          Away: {
            franchise: franchise.id,
          },
        },
      ],
      matchType: MatchType.BO2,
      season: season,
      dateScheduled: {
        lt: new Date(),
      },
    },
    include: {
      Home: {
        include: {
          Franchise: {
            select: {
              Brand: {
                select: {
                  logo: true,
                },
              },
            },
          },
        },
      },
      Away: {
        include: {
          Franchise: {
            select: {
              Brand: {
                select: {
                  logo: true,
                },
              },
            },
          },
        },
      },
      Games: true,
    },
  });
}
