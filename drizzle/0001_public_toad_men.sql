ALTER TABLE `Accolades` RENAME COLUMN `userID` TO `userId`;--> statement-breakpoint
ALTER TABLE `Account` RENAME COLUMN `riotIGN` TO `riotIgn`;--> statement-breakpoint
ALTER TABLE `Draft` RENAME COLUMN `userID` TO `userId`;--> statement-breakpoint
ALTER TABLE `Franchise` RENAME COLUMN `roleID` TO `roleId`;--> statement-breakpoint
ALTER TABLE `Franchise` RENAME COLUMN `gmID` TO `gmId`;--> statement-breakpoint
ALTER TABLE `Franchise` RENAME COLUMN `agm1ID` TO `agm1Id`;--> statement-breakpoint
ALTER TABLE `Franchise` RENAME COLUMN `agm2ID` TO `agm2Id`;--> statement-breakpoint
ALTER TABLE `Franchise` RENAME COLUMN `agm3ID` TO `agm3Id`;--> statement-breakpoint
ALTER TABLE `Franchise` RENAME COLUMN `transactionsChannelID` TO `transactionsChannelId`;--> statement-breakpoint
ALTER TABLE `Games` RENAME COLUMN `gameID` TO `gameId`;--> statement-breakpoint
ALTER TABLE `Games` RENAME COLUMN `matchID` TO `matchId`;--> statement-breakpoint
ALTER TABLE `MapBans` RENAME COLUMN `matchID` TO `matchId`;--> statement-breakpoint
ALTER TABLE `Matches` RENAME COLUMN `matchID` TO `matchId`;--> statement-breakpoint
ALTER TABLE `ModLogs` RENAME COLUMN `discordID` TO `discordId`;--> statement-breakpoint
ALTER TABLE `ModLogs` RENAME COLUMN `modID` TO `modId`;--> statement-breakpoint
ALTER TABLE `PlayerStats` RENAME COLUMN `userID` TO `userId`;--> statement-breakpoint
ALTER TABLE `PlayerStats` RENAME COLUMN `gameID` TO `gameId`;--> statement-breakpoint
ALTER TABLE `PlayerStats` RENAME COLUMN `substituteID` TO `substituteId`;--> statement-breakpoint
ALTER TABLE `Records` RENAME COLUMN `userID` TO `userId`;--> statement-breakpoint
ALTER TABLE `Status` RENAME COLUMN `userID` TO `userId`;--> statement-breakpoint
ALTER TABLE `Substitute` RENAME COLUMN `matchID` TO `matchId`;--> statement-breakpoint
ALTER TABLE `Substitute` RENAME COLUMN `subID` TO `subId`;--> statement-breakpoint
ALTER TABLE `Substitute` RENAME COLUMN `subbedID` TO `subbedId`;--> statement-breakpoint
ALTER TABLE `User` RENAME COLUMN `primaryRiotAccountID` TO `primaryRiotAccountId`;--> statement-breakpoint
ALTER TABLE `Franchise` DROP INDEX `Franchise_gmID_key`;--> statement-breakpoint
ALTER TABLE `Franchise` DROP INDEX `Franchise_agm1ID_key`;--> statement-breakpoint
ALTER TABLE `Franchise` DROP INDEX `Franchise_agm2ID_key`;--> statement-breakpoint
ALTER TABLE `Franchise` DROP INDEX `Franchise_agm3ID_key`;--> statement-breakpoint
ALTER TABLE `Games` DROP INDEX `Games_gameID_key`;--> statement-breakpoint
ALTER TABLE `Matches` DROP INDEX `Matches_matchID_key`;--> statement-breakpoint
ALTER TABLE `PlayerStats` DROP INDEX `PlayerStats_substituteID_key`;--> statement-breakpoint
ALTER TABLE `Status` DROP INDEX `Status_userID_key`;--> statement-breakpoint
ALTER TABLE `User` DROP INDEX `User_primaryRiotAccountID_key`;--> statement-breakpoint
ALTER TABLE `Accolades` DROP FOREIGN KEY `Accolades_userID_fkey`;
--> statement-breakpoint
ALTER TABLE `Account` DROP FOREIGN KEY `Account_mmr_fkey`;
--> statement-breakpoint
ALTER TABLE `Account` DROP FOREIGN KEY `Account_userId_fkey`;
--> statement-breakpoint
ALTER TABLE `Draft` DROP FOREIGN KEY `Draft_franchise_fkey`;
--> statement-breakpoint
ALTER TABLE `Draft` DROP FOREIGN KEY `Draft_userID_fkey`;
--> statement-breakpoint
ALTER TABLE `Franchise` DROP FOREIGN KEY `Franchise_AGM1`;
--> statement-breakpoint
ALTER TABLE `Franchise` DROP FOREIGN KEY `Franchise_AGM2`;
--> statement-breakpoint
ALTER TABLE `Franchise` DROP FOREIGN KEY `Franchise_AGM3`;
--> statement-breakpoint
ALTER TABLE `Franchise` DROP FOREIGN KEY `Franchise_GM`;
--> statement-breakpoint
ALTER TABLE `FranchiseBrand` DROP FOREIGN KEY `FranchiseBrand_franchise_fkey`;
--> statement-breakpoint
ALTER TABLE `Games` DROP FOREIGN KEY `Games_matchID_fkey`;
--> statement-breakpoint
ALTER TABLE `Games` DROP FOREIGN KEY `Games_winner_fkey`;
--> statement-breakpoint
ALTER TABLE `MapBans` DROP FOREIGN KEY `MapBans_matchID_fkey`;
--> statement-breakpoint
ALTER TABLE `MapBans` DROP FOREIGN KEY `MapBans_team_fkey`;
--> statement-breakpoint
ALTER TABLE `Matches` DROP FOREIGN KEY `Away_Team`;
--> statement-breakpoint
ALTER TABLE `Matches` DROP FOREIGN KEY `Home_Team`;
--> statement-breakpoint
ALTER TABLE `ModLogs` DROP FOREIGN KEY `ModLogs_discordID_fkey`;
--> statement-breakpoint
ALTER TABLE `ModLogs` DROP FOREIGN KEY `ModLogs_modID_fkey`;
--> statement-breakpoint
ALTER TABLE `PlayerStats` DROP FOREIGN KEY `GamePlayerStats`;
--> statement-breakpoint
ALTER TABLE `PlayerStats` DROP FOREIGN KEY `PlayerStats_substituteID_fkey`;
--> statement-breakpoint
ALTER TABLE `PlayerStats` DROP FOREIGN KEY `PlayerStats_team_fkey`;
--> statement-breakpoint
ALTER TABLE `PlayerStats` DROP FOREIGN KEY `PlayerStats_userID_fkey`;
--> statement-breakpoint
ALTER TABLE `Records` DROP FOREIGN KEY `Records_userID_fkey`;
--> statement-breakpoint
ALTER TABLE `Session` DROP FOREIGN KEY `Session_userId_fkey`;
--> statement-breakpoint
ALTER TABLE `Status` DROP FOREIGN KEY `Status_userID_fkey`;
--> statement-breakpoint
ALTER TABLE `Substitute` DROP FOREIGN KEY `Substitute_matchID_fkey`;
--> statement-breakpoint
ALTER TABLE `Substitute` DROP FOREIGN KEY `Substitute_subID_fkey`;
--> statement-breakpoint
ALTER TABLE `Substitute` DROP FOREIGN KEY `Substitute_subbedID_fkey`;
--> statement-breakpoint
ALTER TABLE `Substitute` DROP FOREIGN KEY `Substitute_team_fkey`;
--> statement-breakpoint
ALTER TABLE `Teams` DROP FOREIGN KEY `Teams_captain_fkey`;
--> statement-breakpoint
ALTER TABLE `Teams` DROP FOREIGN KEY `Teams_franchise_fkey`;
--> statement-breakpoint
ALTER TABLE `User` DROP FOREIGN KEY `User_primaryRiotAccountID_fkey`;
--> statement-breakpoint
ALTER TABLE `User` DROP FOREIGN KEY `User_team_fkey`;
--> statement-breakpoint
ALTER TABLE `Accolades` MODIFY COLUMN `id` int AUTO_INCREMENT NOT NULL;--> statement-breakpoint
ALTER TABLE `Accolades` MODIFY COLUMN `season` int NOT NULL;--> statement-breakpoint
ALTER TABLE `Account` MODIFY COLUMN `access_token` text DEFAULT ('NULL');--> statement-breakpoint
ALTER TABLE `Account` MODIFY COLUMN `expires_at` int DEFAULT 'NULL';--> statement-breakpoint
ALTER TABLE `Account` MODIFY COLUMN `mmr` int DEFAULT 'NULL';--> statement-breakpoint
ALTER TABLE `ApiAccess` MODIFY COLUMN `id` int AUTO_INCREMENT NOT NULL;--> statement-breakpoint
ALTER TABLE `ApiAccess` MODIFY COLUMN `active` tinyint NOT NULL DEFAULT 1;--> statement-breakpoint
ALTER TABLE `ApiAccess` MODIFY COLUMN `rateLimit` int NOT NULL DEFAULT 30;--> statement-breakpoint
ALTER TABLE `ControlPanel` MODIFY COLUMN `id` int AUTO_INCREMENT NOT NULL;--> statement-breakpoint
ALTER TABLE `Draft` MODIFY COLUMN `id` int AUTO_INCREMENT NOT NULL;--> statement-breakpoint
ALTER TABLE `Draft` MODIFY COLUMN `season` int NOT NULL;--> statement-breakpoint
ALTER TABLE `Draft` MODIFY COLUMN `round` int NOT NULL;--> statement-breakpoint
ALTER TABLE `Draft` MODIFY COLUMN `pick` int NOT NULL;--> statement-breakpoint
ALTER TABLE `Draft` MODIFY COLUMN `keeper` tinyint NOT NULL;--> statement-breakpoint
ALTER TABLE `Draft` MODIFY COLUMN `franchise` int DEFAULT 'NULL';--> statement-breakpoint
ALTER TABLE `FAQ` MODIFY COLUMN `id` int AUTO_INCREMENT NOT NULL;--> statement-breakpoint
ALTER TABLE `FAQ` MODIFY COLUMN `visible` tinyint NOT NULL DEFAULT 1;--> statement-breakpoint
ALTER TABLE `Franchise` MODIFY COLUMN `id` int AUTO_INCREMENT NOT NULL;--> statement-breakpoint
ALTER TABLE `Franchise` MODIFY COLUMN `active` tinyint NOT NULL DEFAULT 1;--> statement-breakpoint
ALTER TABLE `FranchiseBrand` MODIFY COLUMN `id` int AUTO_INCREMENT NOT NULL;--> statement-breakpoint
ALTER TABLE `FranchiseBrand` MODIFY COLUMN `franchise` int DEFAULT 'NULL';--> statement-breakpoint
ALTER TABLE `FranchiseBrand` MODIFY COLUMN `description` text DEFAULT ('NULL');--> statement-breakpoint
ALTER TABLE `FranchiseBrand` MODIFY COLUMN `draftMessage` text DEFAULT ('NULL');--> statement-breakpoint
ALTER TABLE `Games` MODIFY COLUMN `matchId` int DEFAULT 'NULL';--> statement-breakpoint
ALTER TABLE `Games` MODIFY COLUMN `season` int NOT NULL DEFAULT 8;--> statement-breakpoint
ALTER TABLE `Games` MODIFY COLUMN `winner` int DEFAULT 'NULL';--> statement-breakpoint
ALTER TABLE `Games` MODIFY COLUMN `rounds` int NOT NULL;--> statement-breakpoint
ALTER TABLE `Games` MODIFY COLUMN `roundsWonHome` int NOT NULL;--> statement-breakpoint
ALTER TABLE `Games` MODIFY COLUMN `roundsWonAway` int NOT NULL;--> statement-breakpoint
ALTER TABLE `MapBans` MODIFY COLUMN `id` int AUTO_INCREMENT NOT NULL;--> statement-breakpoint
ALTER TABLE `MapBans` MODIFY COLUMN `matchId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `MapBans` MODIFY COLUMN `order` int NOT NULL;--> statement-breakpoint
ALTER TABLE `MapBans` MODIFY COLUMN `team` int NOT NULL;--> statement-breakpoint
ALTER TABLE `Matches` MODIFY COLUMN `matchId` int AUTO_INCREMENT NOT NULL;--> statement-breakpoint
ALTER TABLE `Matches` MODIFY COLUMN `home` int DEFAULT 'NULL';--> statement-breakpoint
ALTER TABLE `Matches` MODIFY COLUMN `away` int DEFAULT 'NULL';--> statement-breakpoint
ALTER TABLE `Matches` MODIFY COLUMN `matchDay` int DEFAULT 'NULL';--> statement-breakpoint
ALTER TABLE `Matches` MODIFY COLUMN `season` int NOT NULL DEFAULT 8;--> statement-breakpoint
ALTER TABLE `MMR` MODIFY COLUMN `id` int AUTO_INCREMENT NOT NULL;--> statement-breakpoint
ALTER TABLE `MMR` MODIFY COLUMN `numRanked` int DEFAULT 'NULL';--> statement-breakpoint
ALTER TABLE `MMR` MODIFY COLUMN `numCombines` int DEFAULT 'NULL';--> statement-breakpoint
ALTER TABLE `MMR` MODIFY COLUMN `numLastSeason` int DEFAULT 'NULL';--> statement-breakpoint
ALTER TABLE `ModLogs` MODIFY COLUMN `id` int AUTO_INCREMENT NOT NULL;--> statement-breakpoint
ALTER TABLE `ModLogs` MODIFY COLUMN `season` int NOT NULL DEFAULT 8;--> statement-breakpoint
ALTER TABLE `PlayerStats` MODIFY COLUMN `id` int AUTO_INCREMENT NOT NULL;--> statement-breakpoint
ALTER TABLE `PlayerStats` MODIFY COLUMN `team` int DEFAULT 'NULL';--> statement-breakpoint
ALTER TABLE `PlayerStats` MODIFY COLUMN `acs` int DEFAULT 'NULL';--> statement-breakpoint
ALTER TABLE `PlayerStats` MODIFY COLUMN `kills` int DEFAULT 'NULL';--> statement-breakpoint
ALTER TABLE `PlayerStats` MODIFY COLUMN `deaths` int DEFAULT 'NULL';--> statement-breakpoint
ALTER TABLE `PlayerStats` MODIFY COLUMN `assists` int DEFAULT 'NULL';--> statement-breakpoint
ALTER TABLE `PlayerStats` MODIFY COLUMN `firstKills` int DEFAULT 'NULL';--> statement-breakpoint
ALTER TABLE `PlayerStats` MODIFY COLUMN `firstDeaths` int DEFAULT 'NULL';--> statement-breakpoint
ALTER TABLE `PlayerStats` MODIFY COLUMN `plants` int DEFAULT 'NULL';--> statement-breakpoint
ALTER TABLE `PlayerStats` MODIFY COLUMN `defuses` int DEFAULT 'NULL';--> statement-breakpoint
ALTER TABLE `PlayerStats` MODIFY COLUMN `tradeKills` int DEFAULT 'NULL';--> statement-breakpoint
ALTER TABLE `PlayerStats` MODIFY COLUMN `tradeDeaths` int DEFAULT 'NULL';--> statement-breakpoint
ALTER TABLE `PlayerStats` MODIFY COLUMN `ecoKills` int DEFAULT 'NULL';--> statement-breakpoint
ALTER TABLE `PlayerStats` MODIFY COLUMN `ecoDeaths` int DEFAULT 'NULL';--> statement-breakpoint
ALTER TABLE `PlayerStats` MODIFY COLUMN `antiEcoKills` int DEFAULT 'NULL';--> statement-breakpoint
ALTER TABLE `PlayerStats` MODIFY COLUMN `exitKills` int DEFAULT 'NULL';--> statement-breakpoint
ALTER TABLE `PlayerStats` MODIFY COLUMN `clutches` int DEFAULT 'NULL';--> statement-breakpoint
ALTER TABLE `PlayerStats` MODIFY COLUMN `substituteId` int DEFAULT 'NULL';--> statement-breakpoint
ALTER TABLE `PlayerStats` MODIFY COLUMN `antiEcoDeaths` int DEFAULT 'NULL';--> statement-breakpoint
ALTER TABLE `PlayerStats` MODIFY COLUMN `damage` int DEFAULT 'NULL';--> statement-breakpoint
ALTER TABLE `PlayerStats` MODIFY COLUMN `kast` int DEFAULT 'NULL';--> statement-breakpoint
ALTER TABLE `Records` MODIFY COLUMN `id` int AUTO_INCREMENT NOT NULL;--> statement-breakpoint
ALTER TABLE `Records` MODIFY COLUMN `season` int NOT NULL;--> statement-breakpoint
ALTER TABLE `Status` MODIFY COLUMN `contractRemaining` int DEFAULT 'NULL';--> statement-breakpoint
ALTER TABLE `Substitute` MODIFY COLUMN `id` int AUTO_INCREMENT NOT NULL;--> statement-breakpoint
ALTER TABLE `Substitute` MODIFY COLUMN `team` int DEFAULT 'NULL';--> statement-breakpoint
ALTER TABLE `Substitute` MODIFY COLUMN `matchId` int DEFAULT 'NULL';--> statement-breakpoint
ALTER TABLE `Teams` MODIFY COLUMN `id` int AUTO_INCREMENT NOT NULL;--> statement-breakpoint
ALTER TABLE `Teams` MODIFY COLUMN `active` tinyint NOT NULL DEFAULT 1;--> statement-breakpoint
ALTER TABLE `Teams` MODIFY COLUMN `franchise` int NOT NULL;--> statement-breakpoint
ALTER TABLE `Teams` MODIFY COLUMN `midSeasonPlacement` int DEFAULT 'NULL';--> statement-breakpoint
ALTER TABLE `User` MODIFY COLUMN `team` int DEFAULT 'NULL';--> statement-breakpoint
ALTER TABLE `_prisma_migrations` MODIFY COLUMN `logs` text DEFAULT ('NULL');--> statement-breakpoint
ALTER TABLE `_prisma_migrations` MODIFY COLUMN `applied_steps_count` int NOT NULL;--> statement-breakpoint
ALTER TABLE `Franchise` ADD CONSTRAINT `Franchise_gmID_key` UNIQUE(`gmId`);--> statement-breakpoint
ALTER TABLE `Franchise` ADD CONSTRAINT `Franchise_agm1ID_key` UNIQUE(`agm1Id`);--> statement-breakpoint
ALTER TABLE `Franchise` ADD CONSTRAINT `Franchise_agm2ID_key` UNIQUE(`agm2Id`);--> statement-breakpoint
ALTER TABLE `Franchise` ADD CONSTRAINT `Franchise_agm3ID_key` UNIQUE(`agm3Id`);--> statement-breakpoint
ALTER TABLE `Games` ADD CONSTRAINT `Games_gameID_key` UNIQUE(`gameId`);--> statement-breakpoint
ALTER TABLE `Matches` ADD CONSTRAINT `Matches_matchID_key` UNIQUE(`matchId`);--> statement-breakpoint
ALTER TABLE `PlayerStats` ADD CONSTRAINT `PlayerStats_substituteID_key` UNIQUE(`substituteId`);--> statement-breakpoint
ALTER TABLE `Status` ADD CONSTRAINT `Status_userID_key` UNIQUE(`userId`);--> statement-breakpoint
ALTER TABLE `User` ADD CONSTRAINT `User_primaryRiotAccountID_key` UNIQUE(`primaryRiotAccountId`);--> statement-breakpoint
ALTER TABLE `Accolades` ADD CONSTRAINT `Accolades_userId_User_id_fk` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `Account` ADD CONSTRAINT `Account_userId_User_id_fk` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `Account` ADD CONSTRAINT `Account_mmr_MMR_id_fk` FOREIGN KEY (`mmr`) REFERENCES `MMR`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `Draft` ADD CONSTRAINT `Draft_userId_User_id_fk` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `Draft` ADD CONSTRAINT `Draft_franchise_Franchise_id_fk` FOREIGN KEY (`franchise`) REFERENCES `Franchise`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `Franchise` ADD CONSTRAINT `Franchise_gmId_User_id_fk` FOREIGN KEY (`gmId`) REFERENCES `User`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `Franchise` ADD CONSTRAINT `Franchise_agm1Id_User_id_fk` FOREIGN KEY (`agm1Id`) REFERENCES `User`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `Franchise` ADD CONSTRAINT `Franchise_agm2Id_User_id_fk` FOREIGN KEY (`agm2Id`) REFERENCES `User`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `Franchise` ADD CONSTRAINT `Franchise_agm3Id_User_id_fk` FOREIGN KEY (`agm3Id`) REFERENCES `User`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `FranchiseBrand` ADD CONSTRAINT `FranchiseBrand_franchise_Franchise_id_fk` FOREIGN KEY (`franchise`) REFERENCES `Franchise`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `Games` ADD CONSTRAINT `Games_matchId_Matches_matchId_fk` FOREIGN KEY (`matchId`) REFERENCES `Matches`(`matchId`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `Games` ADD CONSTRAINT `Games_winner_Teams_id_fk` FOREIGN KEY (`winner`) REFERENCES `Teams`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `MapBans` ADD CONSTRAINT `MapBans_matchId_Matches_matchId_fk` FOREIGN KEY (`matchId`) REFERENCES `Matches`(`matchId`) ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `MapBans` ADD CONSTRAINT `MapBans_team_Teams_id_fk` FOREIGN KEY (`team`) REFERENCES `Teams`(`id`) ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `Matches` ADD CONSTRAINT `Matches_home_Teams_id_fk` FOREIGN KEY (`home`) REFERENCES `Teams`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `Matches` ADD CONSTRAINT `Matches_away_Teams_id_fk` FOREIGN KEY (`away`) REFERENCES `Teams`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `ModLogs` ADD CONSTRAINT `ModLogs_discordId_Account_providerAccountId_fk` FOREIGN KEY (`discordId`) REFERENCES `Account`(`providerAccountId`) ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `ModLogs` ADD CONSTRAINT `ModLogs_modId_User_id_fk` FOREIGN KEY (`modId`) REFERENCES `User`(`id`) ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `PlayerStats` ADD CONSTRAINT `PlayerStats_userId_User_id_fk` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `PlayerStats` ADD CONSTRAINT `PlayerStats_gameId_Games_gameId_fk` FOREIGN KEY (`gameId`) REFERENCES `Games`(`gameId`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `PlayerStats` ADD CONSTRAINT `PlayerStats_team_Teams_id_fk` FOREIGN KEY (`team`) REFERENCES `Teams`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `PlayerStats` ADD CONSTRAINT `PlayerStats_substituteId_Substitute_id_fk` FOREIGN KEY (`substituteId`) REFERENCES `Substitute`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `Records` ADD CONSTRAINT `Records_userId_User_id_fk` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `Session` ADD CONSTRAINT `Session_userId_User_id_fk` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `Status` ADD CONSTRAINT `Status_userId_User_id_fk` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `Substitute` ADD CONSTRAINT `Substitute_team_Teams_id_fk` FOREIGN KEY (`team`) REFERENCES `Teams`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `Substitute` ADD CONSTRAINT `Substitute_matchId_Matches_matchId_fk` FOREIGN KEY (`matchId`) REFERENCES `Matches`(`matchId`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `Substitute` ADD CONSTRAINT `Substitute_subId_User_id_fk` FOREIGN KEY (`subId`) REFERENCES `User`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `Substitute` ADD CONSTRAINT `Substitute_subbedId_User_id_fk` FOREIGN KEY (`subbedId`) REFERENCES `User`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `Teams` ADD CONSTRAINT `Teams_franchise_Franchise_id_fk` FOREIGN KEY (`franchise`) REFERENCES `Franchise`(`id`) ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `Teams` ADD CONSTRAINT `Teams_captain_User_id_fk` FOREIGN KEY (`captain`) REFERENCES `User`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `User` ADD CONSTRAINT `User_team_Teams_id_fk` FOREIGN KEY (`team`) REFERENCES `Teams`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `User` ADD CONSTRAINT `User_primaryRiotAccountId_Account_providerAccountId_fk` FOREIGN KEY (`primaryRiotAccountId`) REFERENCES `Account`(`providerAccountId`) ON DELETE set null ON UPDATE cascade;