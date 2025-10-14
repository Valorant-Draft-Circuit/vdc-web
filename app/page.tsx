import { auth } from "@/lib/auth/auth";
import HeroSection from "../components/home/HeroSection";
import HowToPlay from "../components/home/HowToPlay";
import News from "../components/home/News";
import { CHANNEL_URL, getLatestYouTubeVideo } from "@/lib/queries/home/youtube";
import { Suspense } from "react";
import NewsSkeleton from "../components/home/NewsSkeleton";
import { AGENTS, AGENTURL } from "@/lib/common/constants";

export default async function Home() {
  const session = await auth();
  const mostRecentVideo = await getLatestYouTubeVideo();

  return (
    <>
      <div className="overflow-hidden">
        <div>
          <HeroSection session={session} />
        </div>
      </div>
      {!session ? (
        <div className="overflow-hidden rounded-lg">
          <div className="px-4 py-2 sm:px-6">
            <h1 className="text-vdcRed italic text-lg lg:text-xl">
              How do I play?
            </h1>
          </div>
          <div className="px-2 py-2">
            <HowToPlay />
          </div>
        </div>
      ) : null}
      <div className="flex flex-col xl:flex-row 4xl:flex-col">
        <div className="overflow-hidden xl:w-3/4 4xl:w-full">
          <div className="px-4 py-2 mt-5 sm:px-6 text-lg lg:text-xl">
            <h1 className="italic">Latest News</h1>
          </div>
          <div className="px-4 py-2 sm:p-6">
            <Suspense
              fallback={
                <div className="flex flex-col xl:flex-row space-y-4 xl:space-x-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <NewsSkeleton key={i} />
                  ))}
                </div>
              }
            >
              <News />
            </Suspense>
          </div>
        </div>
        <div className="overflow-hidden xl:w-1/2 4xl:w-full">
          <div className="px-4 py-2 sm:px-6">
            <h1 className="italic text-lg lg:text-xl">
              <a
                href={CHANNEL_URL}
                className="hover:text-vdcRed"
                target="_blank"
              >
                Latest Media
              </a>
              <span className="text-vdcWhite dark:text-vdcBlack">
                (Hi GumbaYum!)
              </span>
            </h1>
          </div>
          <div className="px-4 py-2 sm:p-6 hover:scale-105 transition duration-150 ease-in-out 4xl:hover:scale-101">
            <div>
              <iframe
                className="w-full xl:h-full aspect-video rounded-xl"
                src={mostRecentVideo}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      </div>
      <div className="overflow-hidden rounded-lg">
                {await (async () => {
                  const { getSeasonCached } = await import("@/lib/common/cache");
                  const { TIERS_LIST } = await import("@/lib/common/constants");
                  const currentSeason = await getSeasonCached();
                  const gameType = "season";
                  const baseUrl = process.env.NEXT_PUBLIC_VDC_URL || "http://localhost:3000";
                  const results = await Promise.all(TIERS_LIST.map(async (tier) => {
                    const res = await fetch(
                      `${baseUrl}/api/stats?type=${gameType}&tier=${tier}&season=${currentSeason}`,
                      { cache: "no-store" }
                    );
                    if (!res.ok) return [];
                    return await res.json();
                  }));
                  const topPlayers = results.map((stats, idx) => {
                    if (!stats || stats.length === 0) return null;
                    const maxMP = Math.max(...stats.map(p => p.matchesPlayed || 0));
                    let minMP = Math.floor(maxMP * 0.66);
                    if (minMP % 2 !== 0) minMP -= 1;
                    return stats
                      .filter(p => (p.matchesPlayed || 0) >= minMP)
                      .map((p) => ({
                        ...p,
                        rating:
                          p.attackRating !== null && p.defenseRating !== null
                            ? (p.attackRating + p.defenseRating) / 2
                            : null,
                      }))
                      .filter((p) => p.rating !== null)
                      .sort((a, b) => b.rating - a.rating)[0];
                  });
                  return (
                    <>
                      <div className="px-4 py-2 sm:px-6 flex justify-between items-center">
                        <h1 className="text-vdcRed italic text-lg lg:text-xl">
                          Highest Rated Player Per Tier
                        </h1>
                        <span className="text-right text-md text-vdcRed font-semibold">Season {currentSeason}</span>
                      </div>
                      <div className="px-2 py-2">
                        <div className="flex flex-row justify-center gap-8 items-start">
                          {TIERS_LIST.map((tier, idx) => {
                            const player = topPlayers[idx];
                            const playerLink = player?.name
                              ? `https://vdc.gg/player/${encodeURIComponent(player.name)}?season=${currentSeason}&by=summary`
                              : null;
                            const teamLabel = player?.team || "—";
                            const teamLink = player?.franchise && player?.team
                              ? `https://vdc.gg/franchises/${player.franchise}?team=${tier.toLowerCase()}`
                              : null;
                            const ratingLink = `https://vdc.gg/stats?type=season&tier=${tier.toLowerCase()}`;
                            return (
                              <div key={tier} className="flex flex-col items-center min-w-[180px] max-w-[220px]">
                                <div className="font-bold text-lg text-vdcRed uppercase mb-2">{tier}</div>
                                <div className="font-semibold text-md text-center mb-1">
                                  {playerLink ? (
                                    <a href={playerLink} className="hover:text-vdcRed hover:underline">{player?.name}</a>
                                  ) : "—"}
                                </div>
                                <div className="flex flex-row items-center justify-center w-full">
                                  <div className="text-sm text-gray-700 dark:text-gray-300 mr-2">
                                    {teamLink ? (
                                      <a href={teamLink} className="hover:text-vdcRed hover:underline">{teamLabel}</a>
                                    ) : teamLabel}
                                  </div>
                                  <div className="font-bold text-vdcRed text-lg">
                                    <a href={ratingLink} className="hover:text-vdcRed hover:underline">
                                      {player?.rating ? player.rating.toFixed(2) : "—"}
                                    </a>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  );
                })()}
      </div>
    </>
  );
}
