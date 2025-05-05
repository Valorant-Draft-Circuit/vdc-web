-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE `Accolades` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`userID` varchar(191) DEFAULT 'NULL',
	`season` int(11) NOT NULL,
	`tier` enum('PROSPECT','APPRENTICE','EXPERT','MYTHIC','MIXED') NOT NULL,
	`accolade` varchar(191) NOT NULL,
	`shorthand` varchar(191) NOT NULL,
	CONSTRAINT `Accolades_id_key` UNIQUE(`id`)
);
--> statement-breakpoint
CREATE TABLE `Account` (
	`id` varchar(191) NOT NULL,
	`userId` varchar(191) NOT NULL,
	`type` varchar(191) NOT NULL,
	`provider` varchar(191) NOT NULL,
	`providerAccountId` varchar(191) NOT NULL,
	`refresh_token` varchar(191) DEFAULT 'NULL',
	`access_token` text DEFAULT 'NULL',
	`expires_at` int(11) DEFAULT 'NULL',
	`token_type` varchar(191) DEFAULT 'NULL',
	`scope` varchar(191) DEFAULT 'NULL',
	`id_token` varchar(191) DEFAULT 'NULL',
	`session_state` varchar(191) DEFAULT 'NULL',
	`riotIGN` varchar(191) DEFAULT 'NULL',
	`mmr` int(11) DEFAULT 'NULL',
	CONSTRAINT `Account_id_key` UNIQUE(`id`),
	CONSTRAINT `Account_providerAccountId_key` UNIQUE(`providerAccountId`),
	CONSTRAINT `Account_mmr_key` UNIQUE(`mmr`)
);
--> statement-breakpoint
CREATE TABLE `ApiAccess` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`key` varchar(191) NOT NULL,
	`owner` varchar(191) DEFAULT 'NULL',
	`active` tinyint(1) NOT NULL DEFAULT 1,
	`rateLimit` int(11) NOT NULL DEFAULT 30,
	`allowedEndpoints` longtext NOT NULL,
	CONSTRAINT `ApiAccess_id_key` UNIQUE(`id`),
	CONSTRAINT `ApiAccess_key_key` UNIQUE(`key`),
	CONSTRAINT `allowedEndpoints` CHECK(json_valid(`allowedEndpoints`))
);
--> statement-breakpoint
CREATE TABLE `ControlPanel` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`name` varchar(191) NOT NULL,
	`value` varchar(191) NOT NULL,
	`notes` varchar(191) NOT NULL,
	CONSTRAINT `ControlPanel_id_key` UNIQUE(`id`)
);
--> statement-breakpoint
CREATE TABLE `Draft` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`season` int(11) NOT NULL,
	`tier` enum('PROSPECT','APPRENTICE','EXPERT','MYTHIC','MIXED') NOT NULL,
	`round` int(11) NOT NULL,
	`pick` int(11) NOT NULL,
	`keeper` tinyint(1) NOT NULL DEFAULT 0,
	`userID` varchar(191) DEFAULT 'NULL',
	`franchise` int(11) DEFAULT 'NULL',
	CONSTRAINT `Draft_id_key` UNIQUE(`id`)
);
--> statement-breakpoint
CREATE TABLE `FAQ` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`question` varchar(191) NOT NULL,
	`answer` varchar(999) NOT NULL,
	`visible` tinyint(1) NOT NULL DEFAULT 1,
	CONSTRAINT `FAQ_id_key` UNIQUE(`id`)
);
--> statement-breakpoint
CREATE TABLE `Franchise` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`name` varchar(191) NOT NULL,
	`slug` varchar(191) NOT NULL,
	`active` tinyint(1) NOT NULL DEFAULT 1,
	`roleID` varchar(191) DEFAULT 'NULL',
	`gmID` varchar(191) DEFAULT 'NULL',
	`agm1ID` varchar(191) DEFAULT 'NULL',
	`agm2ID` varchar(191) DEFAULT 'NULL',
	`agm3ID` varchar(191) DEFAULT 'NULL',
	`transactionsChannelID` varchar(191) DEFAULT 'NULL',
	CONSTRAINT `Franchise_id_key` UNIQUE(`id`),
	CONSTRAINT `Franchise_gmID_key` UNIQUE(`gmID`),
	CONSTRAINT `Franchise_agm1ID_key` UNIQUE(`agm1ID`),
	CONSTRAINT `Franchise_agm2ID_key` UNIQUE(`agm2ID`),
	CONSTRAINT `Franchise_agm3ID_key` UNIQUE(`agm3ID`)
);
--> statement-breakpoint
CREATE TABLE `FranchiseBrand` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`franchise` int(11) DEFAULT 'NULL',
	`logo` varchar(191) DEFAULT 'NULL',
	`colorPrimary` varchar(191) DEFAULT 'NULL',
	`colorSecondary` varchar(191) DEFAULT 'NULL',
	`description` text DEFAULT 'NULL',
	`urlDiscord` varchar(191) DEFAULT 'NULL',
	`urlTwitter` varchar(191) DEFAULT 'NULL',
	`urlMiscellaneous` varchar(191) DEFAULT 'NULL',
	`discordEmote` varchar(191) DEFAULT 'NULL',
	`banner` varchar(191) DEFAULT 'NULL',
	`draftMessage` text DEFAULT 'NULL',
	CONSTRAINT `FranchiseBrand_id_key` UNIQUE(`id`),
	CONSTRAINT `FranchiseBrand_franchise_key` UNIQUE(`franchise`)
);
--> statement-breakpoint
CREATE TABLE `Games` (
	`gameID` varchar(191) NOT NULL,
	`matchID` int(11) DEFAULT 'NULL',
	`season` int(11) NOT NULL DEFAULT 8,
	`tier` enum('PROSPECT','APPRENTICE','EXPERT','MYTHIC','MIXED') NOT NULL,
	`gameType` enum('COMBINE','INVALID','PRE_SEASON','SEASON','FORFEIT','PLAYOFF') NOT NULL,
	`datePlayed` datetime(3) NOT NULL,
	`winner` int(11) DEFAULT 'NULL',
	`rounds` int(11) NOT NULL,
	`roundsWonHome` int(11) NOT NULL,
	`roundsWonAway` int(11) NOT NULL,
	`map` varchar(191) DEFAULT 'NULL',
	CONSTRAINT `Games_gameID_key` UNIQUE(`gameID`)
);
--> statement-breakpoint
CREATE TABLE `MapBans` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`matchID` int(11) NOT NULL,
	`order` int(11) NOT NULL,
	`type` enum('PICK','BAN','DISCARD','DECIDE') NOT NULL,
	`team` int(11) NOT NULL,
	`map` varchar(191) NOT NULL,
	CONSTRAINT `MapBans_id_key` UNIQUE(`id`)
);
--> statement-breakpoint
CREATE TABLE `Matches` (
	`matchID` int(11) AUTO_INCREMENT NOT NULL,
	`tier` enum('PROSPECT','APPRENTICE','EXPERT','MYTHIC','MIXED') NOT NULL,
	`matchType` enum('PRE_SEASON','BO2','MID_PLAYOFF','END_PLAYOFF') NOT NULL,
	`dateScheduled` datetime(3) NOT NULL,
	`home` int(11) DEFAULT 'NULL',
	`away` int(11) DEFAULT 'NULL',
	`matchDay` int(11) DEFAULT 'NULL',
	`season` int(11) NOT NULL DEFAULT 8,
	CONSTRAINT `Matches_matchID_key` UNIQUE(`matchID`)
);
--> statement-breakpoint
CREATE TABLE `MMR` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`numRanked` int(11) DEFAULT 'NULL',
	`numCombines` int(11) DEFAULT 'NULL',
	`numLastSeason` int(11) DEFAULT 'NULL',
	`mmrCombines` double DEFAULT 'NULL',
	`mmrRanked` double DEFAULT 'NULL',
	`mmrBase` double DEFAULT 'NULL',
	`mmrEffective` double DEFAULT 'NULL',
	`mmrSeason` double DEFAULT 'NULL',
	`lastPulled` datetime(3) DEFAULT 'NULL',
	CONSTRAINT `MMR_id_key` UNIQUE(`id`)
);
--> statement-breakpoint
CREATE TABLE `ModLogs` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`discordID` varchar(191) NOT NULL,
	`modID` varchar(191) NOT NULL,
	`season` int(11) NOT NULL DEFAULT 8,
	`date` datetime(3) NOT NULL DEFAULT 'current_timestamp(3)',
	`type` enum('NOTE','INFORMAL_WARNING','FORMAL_WARNING','MUTE','BAN') NOT NULL,
	`message` text NOT NULL,
	`expires` datetime(3) DEFAULT 'NULL',
	CONSTRAINT `ModLogs_id_key` UNIQUE(`id`)
);
--> statement-breakpoint
CREATE TABLE `PlayerStats` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`userID` varchar(191) NOT NULL,
	`gameID` varchar(191) NOT NULL,
	`team` int(11) DEFAULT 'NULL',
	`agent` varchar(191) NOT NULL,
	`ratingAttack` double DEFAULT 'NULL',
	`ratingDefense` double DEFAULT 'NULL',
	`acs` int(11) DEFAULT 'NULL',
	`hsPercent` double DEFAULT 'NULL',
	`kills` int(11) DEFAULT 'NULL',
	`deaths` int(11) DEFAULT 'NULL',
	`assists` int(11) DEFAULT 'NULL',
	`firstKills` int(11) DEFAULT 'NULL',
	`firstDeaths` int(11) DEFAULT 'NULL',
	`plants` int(11) DEFAULT 'NULL',
	`defuses` int(11) DEFAULT 'NULL',
	`tradeKills` int(11) DEFAULT 'NULL',
	`tradeDeaths` int(11) DEFAULT 'NULL',
	`ecoKills` int(11) DEFAULT 'NULL',
	`ecoDeaths` int(11) DEFAULT 'NULL',
	`antiEcoKills` int(11) DEFAULT 'NULL',
	`exitKills` int(11) DEFAULT 'NULL',
	`clutches` int(11) DEFAULT 'NULL',
	`substituteID` int(11) DEFAULT 'NULL',
	`antiEcoDeaths` int(11) DEFAULT 'NULL',
	`damage` int(11) DEFAULT 'NULL',
	`kast` int(11) DEFAULT 'NULL',
	CONSTRAINT `PlayerStats_id_key` UNIQUE(`id`),
	CONSTRAINT `PlayerStats_substituteID_key` UNIQUE(`substituteID`)
);
--> statement-breakpoint
CREATE TABLE `Records` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`userID` varchar(191) DEFAULT 'NULL',
	`season` int(11) NOT NULL,
	`tier` enum('PROSPECT','APPRENTICE','EXPERT','MYTHIC','MIXED') NOT NULL,
	`record` varchar(191) NOT NULL,
	CONSTRAINT `Records_id_key` UNIQUE(`id`)
);
--> statement-breakpoint
CREATE TABLE `Session` (
	`id` varchar(191) NOT NULL,
	`sessionToken` varchar(191) NOT NULL,
	`userId` varchar(191) NOT NULL,
	`expires` datetime(3) NOT NULL,
	CONSTRAINT `Session_sessionToken_key` UNIQUE(`sessionToken`)
);
--> statement-breakpoint
CREATE TABLE `Status` (
	`userID` varchar(191) NOT NULL,
	`leagueStatus` enum('UNREGISTERED','PENDING','APPROVED','DRAFT_ELIGIBLE','FREE_AGENT','RESTRICTED_FREE_AGENT','SIGNED','GENERAL_MANAGER','RETIRED','SUSPENDED') NOT NULL DEFAULT '''UNREGISTERED''',
	`contractStatus` enum('SIGNED','SUBBED_OUT','INACTIVE_RESERVE','ACTIVE_SUB') DEFAULT 'NULL',
	`contractRemaining` int(11) DEFAULT 'NULL',
	CONSTRAINT `Status_userID_key` UNIQUE(`userID`)
);
--> statement-breakpoint
CREATE TABLE `Substitute` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`team` int(11) DEFAULT 'NULL',
	`tier` enum('PROSPECT','APPRENTICE','EXPERT','MYTHIC','MIXED') NOT NULL,
	`matchID` int(11) DEFAULT 'NULL',
	`subID` varchar(191) DEFAULT 'NULL',
	`subbedID` varchar(191) DEFAULT 'NULL',
	CONSTRAINT `Substitute_id_key` UNIQUE(`id`)
);
--> statement-breakpoint
CREATE TABLE `Teams` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`name` varchar(191) NOT NULL,
	`tier` enum('PROSPECT','APPRENTICE','EXPERT','MYTHIC','MIXED') NOT NULL,
	`active` tinyint(1) NOT NULL DEFAULT 1,
	`franchise` int(11) NOT NULL,
	`captain` varchar(191) DEFAULT 'NULL',
	`midSeasonPlacement` int(11) DEFAULT 'NULL',
	CONSTRAINT `Teams_id_key` UNIQUE(`id`),
	CONSTRAINT `Teams_captain_key` UNIQUE(`captain`)
);
--> statement-breakpoint
CREATE TABLE `User` (
	`id` varchar(191) NOT NULL,
	`name` varchar(191) DEFAULT 'NULL',
	`team` int(11) DEFAULT 'NULL',
	`primaryRiotAccountID` varchar(191) DEFAULT 'NULL',
	`email` varchar(191) DEFAULT 'NULL',
	`emailVerified` datetime(3) DEFAULT 'NULL',
	`image` varchar(191) DEFAULT 'NULL',
	`roles` varchar(191) NOT NULL DEFAULT '''0x0''',
	`flags` varchar(191) NOT NULL DEFAULT '''0x0''',
	`createdAt` datetime(3) NOT NULL DEFAULT 'current_timestamp(3)',
	CONSTRAINT `User_id_key` UNIQUE(`id`),
	CONSTRAINT `User_primaryRiotAccountID_key` UNIQUE(`primaryRiotAccountID`),
	CONSTRAINT `User_email_key` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `VerificationToken` (
	`identifier` varchar(191) NOT NULL,
	`token` varchar(191) NOT NULL,
	`expires` datetime(3) NOT NULL,
	CONSTRAINT `VerificationToken_token_key` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `_prisma_migrations` (
	`id` varchar(36) NOT NULL,
	`checksum` varchar(64) NOT NULL,
	`finished_at` datetime(3) DEFAULT 'NULL',
	`migration_name` varchar(255) NOT NULL,
	`logs` text DEFAULT 'NULL',
	`rolled_back_at` datetime(3) DEFAULT 'NULL',
	`started_at` datetime(3) NOT NULL DEFAULT 'current_timestamp(3)',
	`applied_steps_count` int(10) unsigned NOT NULL DEFAULT 0
);
--> statement-breakpoint
ALTER TABLE `Accolades` ADD CONSTRAINT `Accolades_userID_fkey` FOREIGN KEY (`userID`) REFERENCES `User`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `Account` ADD CONSTRAINT `Account_mmr_fkey` FOREIGN KEY (`mmr`) REFERENCES `MMR`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `Account` ADD CONSTRAINT `Account_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `Draft` ADD CONSTRAINT `Draft_franchise_fkey` FOREIGN KEY (`franchise`) REFERENCES `Franchise`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `Draft` ADD CONSTRAINT `Draft_userID_fkey` FOREIGN KEY (`userID`) REFERENCES `User`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `Franchise` ADD CONSTRAINT `Franchise_AGM1` FOREIGN KEY (`agm1ID`) REFERENCES `User`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `Franchise` ADD CONSTRAINT `Franchise_AGM2` FOREIGN KEY (`agm2ID`) REFERENCES `User`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `Franchise` ADD CONSTRAINT `Franchise_AGM3` FOREIGN KEY (`agm3ID`) REFERENCES `User`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `Franchise` ADD CONSTRAINT `Franchise_GM` FOREIGN KEY (`gmID`) REFERENCES `User`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `FranchiseBrand` ADD CONSTRAINT `FranchiseBrand_franchise_fkey` FOREIGN KEY (`franchise`) REFERENCES `Franchise`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `Games` ADD CONSTRAINT `Games_matchID_fkey` FOREIGN KEY (`matchID`) REFERENCES `Matches`(`matchID`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `Games` ADD CONSTRAINT `Games_winner_fkey` FOREIGN KEY (`winner`) REFERENCES `Teams`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `MapBans` ADD CONSTRAINT `MapBans_matchID_fkey` FOREIGN KEY (`matchID`) REFERENCES `Matches`(`matchID`) ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `MapBans` ADD CONSTRAINT `MapBans_team_fkey` FOREIGN KEY (`team`) REFERENCES `Teams`(`id`) ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `Matches` ADD CONSTRAINT `Away_Team` FOREIGN KEY (`away`) REFERENCES `Teams`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `Matches` ADD CONSTRAINT `Home_Team` FOREIGN KEY (`home`) REFERENCES `Teams`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `ModLogs` ADD CONSTRAINT `ModLogs_discordID_fkey` FOREIGN KEY (`discordID`) REFERENCES `Account`(`providerAccountId`) ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `ModLogs` ADD CONSTRAINT `ModLogs_modID_fkey` FOREIGN KEY (`modID`) REFERENCES `User`(`id`) ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `PlayerStats` ADD CONSTRAINT `GamePlayerStats` FOREIGN KEY (`gameID`) REFERENCES `Games`(`gameID`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `PlayerStats` ADD CONSTRAINT `PlayerStats_substituteID_fkey` FOREIGN KEY (`substituteID`) REFERENCES `Substitute`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `PlayerStats` ADD CONSTRAINT `PlayerStats_team_fkey` FOREIGN KEY (`team`) REFERENCES `Teams`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `PlayerStats` ADD CONSTRAINT `PlayerStats_userID_fkey` FOREIGN KEY (`userID`) REFERENCES `User`(`id`) ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `Records` ADD CONSTRAINT `Records_userID_fkey` FOREIGN KEY (`userID`) REFERENCES `User`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `Session` ADD CONSTRAINT `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `Status` ADD CONSTRAINT `Status_userID_fkey` FOREIGN KEY (`userID`) REFERENCES `User`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `Substitute` ADD CONSTRAINT `Substitute_matchID_fkey` FOREIGN KEY (`matchID`) REFERENCES `Matches`(`matchID`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `Substitute` ADD CONSTRAINT `Substitute_subID_fkey` FOREIGN KEY (`subID`) REFERENCES `User`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `Substitute` ADD CONSTRAINT `Substitute_subbedID_fkey` FOREIGN KEY (`subbedID`) REFERENCES `User`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `Substitute` ADD CONSTRAINT `Substitute_team_fkey` FOREIGN KEY (`team`) REFERENCES `Teams`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `Teams` ADD CONSTRAINT `Teams_captain_fkey` FOREIGN KEY (`captain`) REFERENCES `User`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `Teams` ADD CONSTRAINT `Teams_franchise_fkey` FOREIGN KEY (`franchise`) REFERENCES `Franchise`(`id`) ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `User` ADD CONSTRAINT `User_primaryRiotAccountID_fkey` FOREIGN KEY (`primaryRiotAccountID`) REFERENCES `Account`(`providerAccountId`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `User` ADD CONSTRAINT `User_team_fkey` FOREIGN KEY (`team`) REFERENCES `Teams`(`id`) ON DELETE set null ON UPDATE cascade;
*/