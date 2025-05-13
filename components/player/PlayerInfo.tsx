import Image from "next/image";
import { TEAM_LOGOS_URL, TIER_COLOR_MAP } from "@/lib/common/constants";
import Link from "next/link";
import { parseRiotIGN } from "@/lib/common/utils";
import { MVP, WIN, WIN_FM } from "../accolades/Accolades";
import { LeagueStatus } from "@prisma/client";
import { ControlPanel } from "@/prisma";

export default async function PlayerInfo({ playerInfo }: { playerInfo }) {
  const [riotIGN, riotTag] = parseRiotIGN(
    playerInfo.PrimaryRiotAccount.riotIGN
  );
  const mmrShow = await ControlPanel.getMMRDisplayState();
  const STATUS_LABELS: Record<LeagueStatus, string> = {
    [LeagueStatus.SIGNED]: "",
    [LeagueStatus.GENERAL_MANAGER]: "",
    [LeagueStatus.UNREGISTERED]: "Viewer",
    [LeagueStatus.DRAFT_ELIGIBLE]: "DE",
    [LeagueStatus.FREE_AGENT]: "FA",
    [LeagueStatus.RESTRICTED_FREE_AGENT]: "RFA",
    [LeagueStatus.SUSPENDED]: "SUSPENDED",
    [LeagueStatus.RETIRED]: "RETIRED",
    [LeagueStatus.PENDING]: "PENDING",
    [LeagueStatus.APPROVED]: "RETIRED",
  };

  let isPlayerSigned = false;
  let playerTeam;
  let tierColor: string;

  const leagueStatus = playerInfo.Status.leagueStatus;

  if (leagueStatus === LeagueStatus.SIGNED) {
    playerTeam = playerInfo.Team;
    tierColor = TIER_COLOR_MAP[playerInfo.Team.tier];
    isPlayerSigned = true;
  } else if (leagueStatus === LeagueStatus.GENERAL_MANAGER) {
    if (playerInfo.Team) {
      playerTeam = playerInfo.Team;
      tierColor = TIER_COLOR_MAP[playerInfo.Team.tier];
      isPlayerSigned = true;
    } else {
      playerTeam = "GM/AGM";
      tierColor = "vdcBlack";
    }
  } else {
    playerTeam = STATUS_LABELS[leagueStatus] || "UNKNOWN";
    tierColor = "vdcBlack";
  }
  const discordAccount = playerInfo.Accounts.filter(
    (account) => account.provider === "discord"
  )[0];

  const playerAccolades = getAccolades(playerInfo.Accolades);

  return (
    <div className="relative bg-gradient-to-b from-vdcGrey to-vdcBlack xl:col-span-5 xl:rounded-3xl px-10 py-20 overflow-hidden xl:shadow-2xl">
      <div className="flex flex-col gap-2">
        <div className="absolute inset-0 bg-black/80 pointer-events-none" />
        <Image
          alt={playerInfo.name}
          src={playerInfo.image}
          width={5000}
          height={5000}
          className="absolute pointer-events-none inset-0 size-full object-contain sm:right-5 z-0 sm:object-right xl:z-10 justify-self-end brightness-70 opacity-80 drop-shadow-lg"
        />
        <div className="flex flex-row gap-5 z-20">
          <span className="relative inline-block">
            <Link
              href={`https://discord.com/users/${discordAccount.providerAccountId}`}
            >
              <Image
                alt={playerInfo.name}
                src={playerInfo.image}
                className={`size-20 rounded-md border-5 border-${tierColor}`}
                width={250}
                height={250}
              />
            </Link>
          </span>
          <div className="flex flex-col my-auto gap-1">
            <h2 className="text-vdcRed">
              {riotIGN} <span className="text-gray-300 text-sm">{riotTag}</span>
            </h2>
            <div className="flex flex-row gap-1">
              <h2 className="text-vdcWhite text-sm">
                {isPlayerSigned ? (
                  <Link
                    href={`/about/franchise/${playerTeam.Franchise.slug}?team=${playerTeam.tier}`}
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
                  className="size-5 my-auto drop-shadow-xl"
                />
              )}
            </div>
            {mmrShow && (
              <div className="text-sm text-gray-500">
                <h1>MMR: {playerInfo.PrimaryRiotAccount.mmr}</h1>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-row text-sm drop-shadow-2xl gap-1 xl:gap-2 flex-wrap z-20">
          {playerAccolades.map((accolade, id) => (
            <span key={id}>{accolade.symbol}</span>
          ))}
        </div>
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
      case "MVP":
        symbol = <MVP metadata={accolade} />;
        break;
      case "WIN_FM":
        symbol = <WIN_FM metadata={accolade} />;
        break;
      // add more cases if needed
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
