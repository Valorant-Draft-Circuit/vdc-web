import { mysqlTable, mysqlSchema, AnyMySqlColumn, foreignKey, unique, int, varchar, mysqlEnum, text, check, longtext, datetime, double, tinyint } from "drizzle-orm/mysql-core"
import { sql } from "drizzle-orm"

export const accolades = mysqlTable("Accolades", {
	id: int().autoincrement().notNull(),
	userId: varchar({ length: 191 }).default('NULL').references(() => user.id, { onDelete: "set null", onUpdate: "cascade" } ),
	season: int().notNull(),
	tier: mysqlEnum(['PROSPECT','APPRENTICE','EXPERT','MYTHIC','MIXED']).notNull(),
	accolade: varchar({ length: 191 }).notNull(),
	shorthand: varchar({ length: 191 }).notNull(),
},
(table) => [
	unique("Accolades_id_key").on(table.id),
]);

export const account = mysqlTable("Account", {
	id: varchar({ length: 191 }).notNull(),
	userId: varchar({ length: 191 }).notNull().references((): AnyMySqlColumn => user.id, { onDelete: "cascade", onUpdate: "cascade" } ),
	type: varchar({ length: 191 }).notNull(),
	provider: varchar({ length: 191 }).notNull(),
	providerAccountId: varchar({ length: 191 }).notNull(),
	refreshToken: varchar("refresh_token", { length: 191 }).default('NULL'),
	accessToken: text("access_token").default('NULL'),
	expiresAt: int("expires_at").default('NULL'),
	tokenType: varchar("token_type", { length: 191 }).default('NULL'),
	scope: varchar({ length: 191 }).default('NULL'),
	idToken: varchar("id_token", { length: 191 }).default('NULL'),
	sessionState: varchar("session_state", { length: 191 }).default('NULL'),
	riotIgn: varchar({ length: 191 }).default('NULL'),
	mmr: int().default('NULL').references(() => mmr.id, { onDelete: "cascade", onUpdate: "cascade" } ),
},
(table) => [
	unique("Account_id_key").on(table.id),
	unique("Account_providerAccountId_key").on(table.providerAccountId),
	unique("Account_mmr_key").on(table.mmr),
]);

export const apiAccess = mysqlTable("ApiAccess", {
	id: int().autoincrement().notNull(),
	key: varchar({ length: 191 }).notNull(),
	owner: varchar({ length: 191 }).default('NULL'),
	active: tinyint().default(1).notNull(),
	rateLimit: int().default(30).notNull(),
	allowedEndpoints: longtext().notNull(),
},
(table) => [
	unique("ApiAccess_id_key").on(table.id),
	unique("ApiAccess_key_key").on(table.key),
	check("allowedEndpoints", sql`json_valid(\`allowedEndpoints\`)`),
]);

export const controlPanel = mysqlTable("ControlPanel", {
	id: int().autoincrement().notNull(),
	name: varchar({ length: 191 }).notNull(),
	value: varchar({ length: 191 }).notNull(),
	notes: varchar({ length: 191 }).notNull(),
},
(table) => [
	unique("ControlPanel_id_key").on(table.id),
]);

export const draft = mysqlTable("Draft", {
	id: int().autoincrement().notNull(),
	season: int().notNull(),
	tier: mysqlEnum(['PROSPECT','APPRENTICE','EXPERT','MYTHIC','MIXED']).notNull(),
	round: int().notNull(),
	pick: int().notNull(),
	keeper: tinyint().default(0).notNull(),
	userId: varchar({ length: 191 }).default('NULL').references(() => user.id, { onDelete: "set null", onUpdate: "cascade" } ),
	franchise: int().default('NULL').references(() => franchise.id, { onDelete: "set null", onUpdate: "cascade" } ),
},
(table) => [
	unique("Draft_id_key").on(table.id),
]);

export const faq = mysqlTable("FAQ", {
	id: int().autoincrement().notNull(),
	question: varchar({ length: 191 }).notNull(),
	answer: varchar({ length: 999 }).notNull(),
	visible: tinyint().default(1).notNull(),
},
(table) => [
	unique("FAQ_id_key").on(table.id),
]);

export const franchise = mysqlTable("Franchise", {
	id: int().autoincrement().notNull(),
	name: varchar({ length: 191 }).notNull(),
	slug: varchar({ length: 191 }).notNull(),
	active: tinyint().default(1).notNull(),
	roleId: varchar({ length: 191 }).default('NULL'),
	gmId: varchar({ length: 191 }).default('NULL').references(() => user.id, { onDelete: "set null", onUpdate: "cascade" } ),
	agm1Id: varchar({ length: 191 }).default('NULL').references(() => user.id, { onDelete: "set null", onUpdate: "cascade" } ),
	agm2Id: varchar({ length: 191 }).default('NULL').references(() => user.id, { onDelete: "set null", onUpdate: "cascade" } ),
	agm3Id: varchar({ length: 191 }).default('NULL').references(() => user.id, { onDelete: "set null", onUpdate: "cascade" } ),
	transactionsChannelId: varchar({ length: 191 }).default('NULL'),
},
(table) => [
	unique("Franchise_id_key").on(table.id),
	unique("Franchise_gmID_key").on(table.gmId),
	unique("Franchise_agm1ID_key").on(table.agm1Id),
	unique("Franchise_agm2ID_key").on(table.agm2Id),
	unique("Franchise_agm3ID_key").on(table.agm3Id),
]);

export const franchiseBrand = mysqlTable("FranchiseBrand", {
	id: int().autoincrement().notNull(),
	franchise: int().default('NULL').references(() => franchise.id, { onDelete: "set null", onUpdate: "cascade" } ),
	logo: varchar({ length: 191 }).default('NULL'),
	colorPrimary: varchar({ length: 191 }).default('NULL'),
	colorSecondary: varchar({ length: 191 }).default('NULL'),
	description: text().default('NULL'),
	urlDiscord: varchar({ length: 191 }).default('NULL'),
	urlTwitter: varchar({ length: 191 }).default('NULL'),
	urlMiscellaneous: varchar({ length: 191 }).default('NULL'),
	discordEmote: varchar({ length: 191 }).default('NULL'),
	banner: varchar({ length: 191 }).default('NULL'),
	draftMessage: text().default('NULL'),
},
(table) => [
	unique("FranchiseBrand_id_key").on(table.id),
	unique("FranchiseBrand_franchise_key").on(table.franchise),
]);

export const games = mysqlTable("Games", {
	gameId: varchar({ length: 191 }).notNull(),
	matchId: int().default('NULL').references(() => matches.matchId, { onDelete: "set null", onUpdate: "cascade" } ),
	season: int().default(8).notNull(),
	tier: mysqlEnum(['PROSPECT','APPRENTICE','EXPERT','MYTHIC','MIXED']).notNull(),
	gameType: mysqlEnum(['COMBINE','INVALID','PRE_SEASON','SEASON','FORFEIT','PLAYOFF']).notNull(),
	datePlayed: datetime({ mode: 'string', fsp: 3 }).notNull(),
	winner: int().default('NULL').references(() => teams.id, { onDelete: "set null", onUpdate: "cascade" } ),
	rounds: int().notNull(),
	roundsWonHome: int().notNull(),
	roundsWonAway: int().notNull(),
	map: varchar({ length: 191 }).default('NULL'),
},
(table) => [
	unique("Games_gameID_key").on(table.gameId),
]);

export const mapBans = mysqlTable("MapBans", {
	id: int().autoincrement().notNull(),
	matchId: int().notNull().references(() => matches.matchId, { onDelete: "restrict", onUpdate: "cascade" } ),
	order: int().notNull(),
	type: mysqlEnum(['PICK','BAN','DISCARD','DECIDE']).notNull(),
	team: int().notNull().references(() => teams.id, { onDelete: "restrict", onUpdate: "cascade" } ),
	map: varchar({ length: 191 }).notNull(),
},
(table) => [
	unique("MapBans_id_key").on(table.id),
]);

export const matches = mysqlTable("Matches", {
	matchId: int().autoincrement().notNull(),
	tier: mysqlEnum(['PROSPECT','APPRENTICE','EXPERT','MYTHIC','MIXED']).notNull(),
	matchType: mysqlEnum(['PRE_SEASON','BO2','MID_PLAYOFF','END_PLAYOFF']).notNull(),
	dateScheduled: datetime({ mode: 'string', fsp: 3 }).notNull(),
	home: int().default('NULL').references(() => teams.id, { onDelete: "set null", onUpdate: "cascade" } ),
	away: int().default('NULL').references(() => teams.id, { onDelete: "set null", onUpdate: "cascade" } ),
	matchDay: int().default('NULL'),
	season: int().default(8).notNull(),
},
(table) => [
	unique("Matches_matchID_key").on(table.matchId),
]);

export const mmr = mysqlTable("MMR", {
	id: int().autoincrement().notNull(),
	numRanked: int().default('NULL'),
	numCombines: int().default('NULL'),
	numLastSeason: int().default('NULL'),
	mmrCombines: double().default('NULL'),
	mmrRanked: double().default('NULL'),
	mmrBase: double().default('NULL'),
	mmrEffective: double().default('NULL'),
	mmrSeason: double().default('NULL'),
	lastPulled: datetime({ mode: 'string', fsp: 3 }).default('NULL'),
},
(table) => [
	unique("MMR_id_key").on(table.id),
]);

export const modLogs = mysqlTable("ModLogs", {
	id: int().autoincrement().notNull(),
	discordId: varchar({ length: 191 }).notNull().references(() => account.providerAccountId, { onDelete: "restrict", onUpdate: "cascade" } ),
	modId: varchar({ length: 191 }).notNull().references(() => user.id, { onDelete: "restrict", onUpdate: "cascade" } ),
	season: int().default(8).notNull(),
	date: datetime({ mode: 'string', fsp: 3 }).default('current_timestamp(3)').notNull(),
	type: mysqlEnum(['NOTE','INFORMAL_WARNING','FORMAL_WARNING','MUTE','BAN']).notNull(),
	message: text().notNull(),
	expires: datetime({ mode: 'string', fsp: 3 }).default('NULL'),
},
(table) => [
	unique("ModLogs_id_key").on(table.id),
]);

export const playerStats = mysqlTable("PlayerStats", {
	id: int().autoincrement().notNull(),
	userId: varchar({ length: 191 }).notNull().references(() => user.id, { onDelete: "restrict", onUpdate: "cascade" } ),
	gameId: varchar({ length: 191 }).notNull().references(() => games.gameId, { onDelete: "cascade", onUpdate: "cascade" } ),
	team: int().default('NULL').references(() => teams.id, { onDelete: "set null", onUpdate: "cascade" } ),
	agent: varchar({ length: 191 }).notNull(),
	ratingAttack: double().default('NULL'),
	ratingDefense: double().default('NULL'),
	acs: int().default('NULL'),
	hsPercent: double().default('NULL'),
	kills: int().default('NULL'),
	deaths: int().default('NULL'),
	assists: int().default('NULL'),
	firstKills: int().default('NULL'),
	firstDeaths: int().default('NULL'),
	plants: int().default('NULL'),
	defuses: int().default('NULL'),
	tradeKills: int().default('NULL'),
	tradeDeaths: int().default('NULL'),
	ecoKills: int().default('NULL'),
	ecoDeaths: int().default('NULL'),
	antiEcoKills: int().default('NULL'),
	exitKills: int().default('NULL'),
	clutches: int().default('NULL'),
	substituteId: int().default('NULL').references(() => substitute.id, { onDelete: "set null", onUpdate: "cascade" } ),
	antiEcoDeaths: int().default('NULL'),
	damage: int().default('NULL'),
	kast: int().default('NULL'),
},
(table) => [
	unique("PlayerStats_id_key").on(table.id),
	unique("PlayerStats_substituteID_key").on(table.substituteId),
]);

export const records = mysqlTable("Records", {
	id: int().autoincrement().notNull(),
	userId: varchar({ length: 191 }).default('NULL').references(() => user.id, { onDelete: "set null", onUpdate: "cascade" } ),
	season: int().notNull(),
	tier: mysqlEnum(['PROSPECT','APPRENTICE','EXPERT','MYTHIC','MIXED']).notNull(),
	record: varchar({ length: 191 }).notNull(),
},
(table) => [
	unique("Records_id_key").on(table.id),
]);

export const session = mysqlTable("Session", {
	id: varchar({ length: 191 }).notNull(),
	sessionToken: varchar({ length: 191 }).notNull(),
	userId: varchar({ length: 191 }).notNull().references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" } ),
	expires: datetime({ mode: 'string', fsp: 3 }).notNull(),
},
(table) => [
	unique("Session_sessionToken_key").on(table.sessionToken),
]);

export const status = mysqlTable("Status", {
	userId: varchar({ length: 191 }).notNull().references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" } ),
	leagueStatus: mysqlEnum(['UNREGISTERED','PENDING','APPROVED','DRAFT_ELIGIBLE','FREE_AGENT','RESTRICTED_FREE_AGENT','SIGNED','GENERAL_MANAGER','RETIRED','SUSPENDED']).default('\'UNREGISTERED\'').notNull(),
	contractStatus: mysqlEnum(['SIGNED','SUBBED_OUT','INACTIVE_RESERVE','ACTIVE_SUB']).default('NULL'),
	contractRemaining: int().default('NULL'),
},
(table) => [
	unique("Status_userID_key").on(table.userId),
]);

export const substitute = mysqlTable("Substitute", {
	id: int().autoincrement().notNull(),
	team: int().default('NULL').references(() => teams.id, { onDelete: "set null", onUpdate: "cascade" } ),
	tier: mysqlEnum(['PROSPECT','APPRENTICE','EXPERT','MYTHIC','MIXED']).notNull(),
	matchId: int().default('NULL').references(() => matches.matchId, { onDelete: "set null", onUpdate: "cascade" } ),
	subId: varchar({ length: 191 }).default('NULL').references(() => user.id, { onDelete: "set null", onUpdate: "cascade" } ),
	subbedId: varchar({ length: 191 }).default('NULL').references(() => user.id, { onDelete: "set null", onUpdate: "cascade" } ),
},
(table) => [
	unique("Substitute_id_key").on(table.id),
]);

export const teams = mysqlTable("Teams", {
	id: int().autoincrement().notNull(),
	name: varchar({ length: 191 }).notNull(),
	tier: mysqlEnum(['PROSPECT','APPRENTICE','EXPERT','MYTHIC','MIXED']).notNull(),
	active: tinyint().default(1).notNull(),
	franchise: int().notNull().references(() => franchise.id, { onDelete: "restrict", onUpdate: "cascade" } ),
	captain: varchar({ length: 191 }).default('NULL').references((): AnyMySqlColumn => user.id, { onDelete: "set null", onUpdate: "cascade" } ),
	midSeasonPlacement: int().default('NULL'),
},
(table) => [
	unique("Teams_id_key").on(table.id),
	unique("Teams_captain_key").on(table.captain),
]);

export const user = mysqlTable("User", {
	id: varchar({ length: 191 }).notNull(),
	name: varchar({ length: 191 }).default('NULL'),
	team: int().default('NULL').references((): AnyMySqlColumn => teams.id, { onDelete: "set null", onUpdate: "cascade" } ),
	primaryRiotAccountId: varchar({ length: 191 }).default('NULL').references((): AnyMySqlColumn => account.providerAccountId, { onDelete: "set null", onUpdate: "cascade" } ),
	email: varchar({ length: 191 }).default('NULL'),
	emailVerified: datetime({ mode: 'string', fsp: 3 }).default('NULL'),
	image: varchar({ length: 191 }).default('NULL'),
	roles: varchar({ length: 191 }).default('\'0x0\'').notNull(),
	flags: varchar({ length: 191 }).default('\'0x0\'').notNull(),
	createdAt: datetime({ mode: 'string', fsp: 3 }).default('current_timestamp(3)').notNull(),
},
(table) => [
	unique("User_id_key").on(table.id),
	unique("User_primaryRiotAccountID_key").on(table.primaryRiotAccountId),
	unique("User_email_key").on(table.email),
]);

export const verificationToken = mysqlTable("VerificationToken", {
	identifier: varchar({ length: 191 }).notNull(),
	token: varchar({ length: 191 }).notNull(),
	expires: datetime({ mode: 'string', fsp: 3 }).notNull(),
},
(table) => [
	unique("VerificationToken_token_key").on(table.token),
]);

export const prismaMigrations = mysqlTable("_prisma_migrations", {
	id: varchar({ length: 36 }).notNull(),
	checksum: varchar({ length: 64 }).notNull(),
	finishedAt: datetime("finished_at", { mode: 'string', fsp: 3 }).default('NULL'),
	migrationName: varchar("migration_name", { length: 255 }).notNull(),
	logs: text().default('NULL'),
	rolledBackAt: datetime("rolled_back_at", { mode: 'string', fsp: 3 }).default('NULL'),
	startedAt: datetime("started_at", { mode: 'string', fsp: 3 }).default('current_timestamp(3)').notNull(),
	appliedStepsCount: int("applied_steps_count").default(0).notNull(),
});
