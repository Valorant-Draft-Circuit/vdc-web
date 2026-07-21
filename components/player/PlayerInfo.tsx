import Image from "next/image";
import { ImageWithFallback } from "@/components/theme/ImageWithFallback";
import PlayerAvatar from "@/components/theme/PlayerAvatar";
import { avatarColor } from "@/lib/common/avatar";
import {
  TEAM_LOGOS_URL,
  TRACKER_PROFILE_URL,
} from "@/lib/common/constants/urls";
import { TIER_COLOR_MAP } from "@/lib/common/constants/tiers";
import { STATUS_LABELS } from "@/lib/common/constants/leagueStatus";
import Link from "next/link";
import { parseRiotIGN } from "@/lib/common/player";
import { AST, MVP, WIN, WIN_FM } from "../accolades/Accolades";
import { LeagueStatus, Tier } from "@prisma/client";
import { ControlPanel } from "@/prisma";
import { PlayerProfile } from "@/lib/types/player";

export default async function PlayerInfo({
  playerInfo,
}: {
  playerInfo: PlayerProfile;
}) {
  const encodedIGN = encodeURIComponent(
    playerInfo.PrimaryRiotAccount!.riotIGN!,
  );
  const [riotIGN, riotTag] = parseRiotIGN(
    playerInfo.PrimaryRiotAccount!.riotIGN!,
  );
  const mmrShow = await ControlPanel.getMMRDisplayState();

  let isPlayerSigned = false;
  let playerTeam;
  let tierColor: string;
  let teamTierSlug: string | undefined;

  const leagueStatus = playerInfo.Status!.leagueStatus;

  if (leagueStatus === LeagueStatus.SIGNED) {
    playerTeam = playerInfo.Team!;
    tierColor = TIER_COLOR_MAP[playerTeam.tier];
    teamTierSlug = playerTeam.tier.toLowerCase();
    isPlayerSigned = true;
  } else if (leagueStatus === LeagueStatus.GENERAL_MANAGER) {
    if (playerInfo.Team) {
      playerTeam = playerInfo.Team;
      tierColor = TIER_COLOR_MAP[playerTeam.tier];
      teamTierSlug = playerTeam.tier.toLowerCase();
      isPlayerSigned = true;
    } else {
      playerTeam = "GM/AGM";
      tierColor = "vdcBlack";
    }
  } else {
    playerTeam = STATUS_LABELS[leagueStatus] || "UNKNOWN";
    tierColor = "vdcBlack";
  }
  const discordAccountId = playerInfo.Accounts.filter(
    (account) => account.provider === "discord",
  )[0].providerAccountId;

  let showMmr = mmrShow;
  if (!playerInfo.PrimaryRiotAccount!.MMR) {
    showMmr = false;
  }
  const playerAccolades = getAccolades(playerInfo.Accolades);
  return (
    <div className="relative bg-linear-to-b from-vdcGrey to-vdcBlack xl:col-span-5 xl:rounded-3xl px-10 xl:px-14 aspect-[3/2] sm:aspect-[5/2] xl:aspect-[7/2] flex flex-col justify-center overflow-hidden xl:shadow-2xl">
      <div className="flex flex-col gap-2">
        <div className="absolute inset-0 bg-black/80 pointer-events-none" />
        <ProfileBanner playerInfo={playerInfo} />
        <div className="flex flex-row gap-5 z-10">
          <span className="relative inline-block">
            <a
              target="_blank"
              href={`https://discord.com/users/${discordAccountId}`}
            >
              <span
                className={`inline-block rounded-md border-5 border-${tierColor} overflow-hidden`}
              >
                <PlayerAvatar
                  name={playerInfo.name ?? "??"}
                  image={playerInfo.image ?? null}
                  fallbackColor={avatarColor(discordAccountId ?? playerInfo.name ?? "?")}
                  sizeClass="size-20 xl:size-28"
                  pixels={224}
                  textClass="text-2xl"
                  shapeClass="rounded-none"
                />
              </span>
            </a>
          </span>
          <div className="flex flex-col my-auto gap-1">
            <a
              target="_blank"
              href={`${TRACKER_PROFILE_URL}/${encodedIGN}`}
              className="hover:opacity-80"
            >
              <h2 className="text-vdcRed xl:text-xl">
                {riotIGN}
                <span className="text-gray-300 text-sm xl:text-base">
                  {riotTag}
                </span>
              </h2>
            </a>
            <div className="flex flex-row gap-1">
              <h2 className="text-vdcWhite text-sm xl:text-base">
                {isPlayerSigned ? (
                  <Link
                    href={`/franchises/${playerTeam.Franchise.slug}?team=${teamTierSlug}`}
                    className="hover:text-vdcRed hover:underline"
                  >
                    {playerTeam.Franchise.slug} | {playerTeam.name}
                  </Link>
                ) : (
                  <div>{playerTeam}</div>
                )}
              </h2>
              {isPlayerSigned && (
                <Image
                  alt={playerTeam.Franchise.slug}
                  src={`${TEAM_LOGOS_URL}${playerTeam.Franchise.Brand.logo}`}
                  width={250}
                  height={250}
                  className="size-5 xl:size-7 my-auto drop-shadow-xl"
                />
              )}
            </div>
            {showMmr && (
              <div className="text-sm xl:text-base text-gray-300">
                <h1>MMR: {playerInfo.PrimaryRiotAccount!.MMR!.mmrEffective}</h1>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-row text-sm drop-shadow-2xl gap-1 xl:gap-2 flex-wrap z-10">
          <QuickLinks ign={encodedIGN} discordId={discordAccountId} />
          {playerTeam.tier && <TierBadge tier={playerTeam.tier} />}
          {playerAccolades.map((accolade, id) => (
            <span key={id}>{accolade.symbol}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function QuickLinks({ ign, discordId }: { ign: string; discordId: string }) {
  return (
    <>
      <a target="_blank" href={`${TRACKER_PROFILE_URL}/${ign}`}>
        <div
          className={`flex flex-row px-3 py-2 bg-linear-to-br bg-[#e2273c] rounded-md text-xs text-vdcBlack gap-1 hover:brightness-80`}
        >
          <Image
            src="/external/trn-logo.svg"
            width={1000}
            height={1000}
            alt="TRN"
            className="h-2 w-auto m-auto"
          />
        </div>
      </a>
      <a target="_blank" href={`https://discord.com/users/${discordId}`}>
        <div
          className={`flex flex-row px-4 py-2 bg-linear-to-br bg-[#5865F2] rounded-md text-xs text-vdcBlack gap-1 hover:brightness-80`}
        >
          <Image
            src="/external/discord-logo.svg"
            width={1000}
            height={1000}
            alt="TRN"
            className="h-2 w-auto m-auto"
          />
        </div>
      </a>
    </>
  );
}

function ProfileBanner({ playerInfo }: { playerInfo: PlayerProfile }) {
  const hasBanner = playerInfo.banner;
  if (hasBanner) {
    return (
      <ImageWithFallback
        alt={playerInfo.name ?? ""}
        src={playerInfo.banner ?? ""}
        fallbackSrc={playerInfo.image ?? "/vdc-flame.svg"}
        fill
        sizes="100vw"
        className="absolute pointer-events-none inset-0 object-cover z-0 xl:z-10 brightness-35 dark:brightness-20"
      />
    );
  }
  return (
    <ImageWithFallback
      alt={playerInfo.name ?? ""}
      src={playerInfo.image ?? "/vdc-flame.svg"}
      fallbackSrc="/vdc-flame.svg"
      width={5000}
      height={5000}
      className="absolute pointer-events-none inset-0 size-full object-contain z-0 sm:object-right xl:z-10 justify-self-end brightness-50 opacity-80 drop-shadow-lg"
    />
  );
}

function TierBadge(tier) {
  const tierString = tier.tier;
  return (
    <div className="relative group">
      <div
        className={`${
          tierString === Tier.PROSPECT
            ? "to-yellow-600"
            : tierString === Tier.APPRENTICE
              ? "to-green-600"
              : tierString === Tier.EXPERT
                ? "to-blue-600"
                : "to-purple-600"
        } flex flex-row px-2 py-1 bg-linear-to-br from-vdcWhite rounded-md text-xs text-vdcBlack gap-1`}
      >
        <h1>{tierString}</h1>
      </div>
    </div>
  );
}

function getAccolades(accolades) {
  const accoladesWithSymbol = accolades.map((accolade) => {
    let symbol;

    switch (accolade.shorthand) {
      case "WIN":
        symbol = <WIN metadata={accolade} />;
        break;
      case "WIN_SUB":
        symbol = <WIN metadata={accolade} />;
        break;
      case "MVP":
        symbol = <MVP metadata={accolade} />;
        break;
      case "WIN_FM":
        symbol = <WIN_FM metadata={accolade} />;
        break;
      case "AST":
        symbol = <AST metadata={accolade} />;
        break;
      default:
        symbol = null;
    }

    return {
      ...accolade,
      symbol,
    };
  });
  return accoladesWithSymbol;
}
