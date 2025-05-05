import { relations } from "drizzle-orm/relations";
import { user, accolades, mmr, account, franchise, draft, franchiseBrand, matches, games, teams, mapBans, modLogs, playerStats, substitute, records, session, status } from "./schema";

export const accoladesRelations = relations(accolades, ({one}) => ({
	user: one(user, {
		fields: [accolades.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({one, many}) => ({
	accolades: many(accolades),
	accounts: many(account, {
		relationName: "account_userId_user_id"
	}),
	drafts: many(draft),
	franchises_agm1Id: many(franchise, {
		relationName: "franchise_agm1Id_user_id"
	}),
	franchises_agm2Id: many(franchise, {
		relationName: "franchise_agm2Id_user_id"
	}),
	franchises_agm3Id: many(franchise, {
		relationName: "franchise_agm3Id_user_id"
	}),
	franchises_gmId: many(franchise, {
		relationName: "franchise_gmId_user_id"
	}),
	modLogs: many(modLogs),
	playerStats: many(playerStats),
	records: many(records),
	sessions: many(session),
	statuses: many(status),
	substitutes_subId: many(substitute, {
		relationName: "substitute_subId_user_id"
	}),
	substitutes_subbedId: many(substitute, {
		relationName: "substitute_subbedId_user_id"
	}),
	teams: many(teams, {
		relationName: "teams_captain_user_id"
	}),
	account: one(account, {
		fields: [user.primaryRiotAccountId],
		references: [account.providerAccountId],
		relationName: "user_primaryRiotAccountId_account_providerAccountId"
	}),
	team: one(teams, {
		fields: [user.team],
		references: [teams.id],
		relationName: "user_team_teams_id"
	}),
}));

export const accountRelations = relations(account, ({one, many}) => ({
	mmr: one(mmr, {
		fields: [account.mmr],
		references: [mmr.id]
	}),
	user: one(user, {
		fields: [account.userId],
		references: [user.id],
		relationName: "account_userId_user_id"
	}),
	modLogs: many(modLogs),
	users: many(user, {
		relationName: "user_primaryRiotAccountId_account_providerAccountId"
	}),
}));

export const mmrRelations = relations(mmr, ({many}) => ({
	accounts: many(account),
}));

export const draftRelations = relations(draft, ({one}) => ({
	franchise: one(franchise, {
		fields: [draft.franchise],
		references: [franchise.id]
	}),
	user: one(user, {
		fields: [draft.userId],
		references: [user.id]
	}),
}));

export const franchiseRelations = relations(franchise, ({one, many}) => ({
	drafts: many(draft),
	user_agm1Id: one(user, {
		fields: [franchise.agm1Id],
		references: [user.id],
		relationName: "franchise_agm1Id_user_id"
	}),
	user_agm2Id: one(user, {
		fields: [franchise.agm2Id],
		references: [user.id],
		relationName: "franchise_agm2Id_user_id"
	}),
	user_agm3Id: one(user, {
		fields: [franchise.agm3Id],
		references: [user.id],
		relationName: "franchise_agm3Id_user_id"
	}),
	user_gmId: one(user, {
		fields: [franchise.gmId],
		references: [user.id],
		relationName: "franchise_gmId_user_id"
	}),
	franchiseBrands: many(franchiseBrand),
	teams: many(teams),
}));

export const franchiseBrandRelations = relations(franchiseBrand, ({one}) => ({
	franchise: one(franchise, {
		fields: [franchiseBrand.franchise],
		references: [franchise.id]
	}),
}));

export const gamesRelations = relations(games, ({one, many}) => ({
	match: one(matches, {
		fields: [games.matchId],
		references: [matches.matchId]
	}),
	team: one(teams, {
		fields: [games.winner],
		references: [teams.id]
	}),
	playerStats: many(playerStats),
}));

export const matchesRelations = relations(matches, ({one, many}) => ({
	games: many(games),
	mapBans: many(mapBans),
	team_away: one(teams, {
		fields: [matches.away],
		references: [teams.id],
		relationName: "matches_away_teams_id"
	}),
	team_home: one(teams, {
		fields: [matches.home],
		references: [teams.id],
		relationName: "matches_home_teams_id"
	}),
	substitutes: many(substitute),
}));

export const teamsRelations = relations(teams, ({one, many}) => ({
	games: many(games),
	mapBans: many(mapBans),
	matches_away: many(matches, {
		relationName: "matches_away_teams_id"
	}),
	matches_home: many(matches, {
		relationName: "matches_home_teams_id"
	}),
	playerStats: many(playerStats),
	substitutes: many(substitute),
	user: one(user, {
		fields: [teams.captain],
		references: [user.id],
		relationName: "teams_captain_user_id"
	}),
	franchise: one(franchise, {
		fields: [teams.franchise],
		references: [franchise.id]
	}),
	users: many(user, {
		relationName: "user_team_teams_id"
	}),
}));

export const mapBansRelations = relations(mapBans, ({one}) => ({
	match: one(matches, {
		fields: [mapBans.matchId],
		references: [matches.matchId]
	}),
	team: one(teams, {
		fields: [mapBans.team],
		references: [teams.id]
	}),
}));

export const modLogsRelations = relations(modLogs, ({one}) => ({
	account: one(account, {
		fields: [modLogs.discordId],
		references: [account.providerAccountId]
	}),
	user: one(user, {
		fields: [modLogs.modId],
		references: [user.id]
	}),
}));

export const playerStatsRelations = relations(playerStats, ({one}) => ({
	game: one(games, {
		fields: [playerStats.gameId],
		references: [games.gameId]
	}),
	substitute: one(substitute, {
		fields: [playerStats.substituteId],
		references: [substitute.id]
	}),
	team: one(teams, {
		fields: [playerStats.team],
		references: [teams.id]
	}),
	user: one(user, {
		fields: [playerStats.userId],
		references: [user.id]
	}),
}));

export const substituteRelations = relations(substitute, ({one, many}) => ({
	playerStats: many(playerStats),
	match: one(matches, {
		fields: [substitute.matchId],
		references: [matches.matchId]
	}),
	user_subId: one(user, {
		fields: [substitute.subId],
		references: [user.id],
		relationName: "substitute_subId_user_id"
	}),
	user_subbedId: one(user, {
		fields: [substitute.subbedId],
		references: [user.id],
		relationName: "substitute_subbedId_user_id"
	}),
	team: one(teams, {
		fields: [substitute.team],
		references: [teams.id]
	}),
}));

export const recordsRelations = relations(records, ({one}) => ({
	user: one(user, {
		fields: [records.userId],
		references: [user.id]
	}),
}));

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const statusRelations = relations(status, ({one}) => ({
	user: one(user, {
		fields: [status.userId],
		references: [user.id]
	}),
}));