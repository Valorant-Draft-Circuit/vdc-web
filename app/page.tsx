import { auth } from "@/lib/auth/auth";
import HeroSection from "../components/home/HeroSection";
import HowToPlay from "../components/home/HowToPlay";
import News from "../components/home/News";
import MediaSocials from "../components/home/MediaSocials";
import { CHANNEL_URL, getLatestYouTubeVideo } from "@/lib/queries/home/youtube";
import { Suspense } from "react";
import NewsSkeleton from "../components/home/NewsSkeleton";
import UpcomingMatch, {
  ViewFullSchedule,
} from "@/components/schedule/upcoming/UpcomingMatch";
import { getEveryUpcomingMatch } from "@/lib/queries/schedule/schedule";
import MatchNightRecapLoader from "@/components/home/recap/MatchNightRecapLoader";
import MatchNightRecapSkeleton from "@/components/home/recap/MatchNightRecapSkeleton";
import RecentTransactionsLoader from "@/components/home/transactions/RecentTransactionsLoader";
import RecentTransactionsSkeleton from "@/components/home/transactions/RecentTransactionsSkeleton";

export default async function Home() {
  const session = await auth();
  const mostRecentVideo = await getLatestYouTubeVideo();
  const upcomingMatches = await getEveryUpcomingMatch();
  const displayUpcomingMatches = upcomingMatches.length !== 0;

  return (
    <>
      {displayUpcomingMatches && (
        <div className="xl:p-4 ">
          <div className="flex flex-row gap-4 p-5 bg-gray-300 xl:rounded-2xl dark:bg-vdcGrey overflow-auto ">
            {upcomingMatches.map((match) => (
              <UpcomingMatch key={match.matchID} match={match} />
            ))}
            <ViewFullSchedule />
          </div>
        </div>
      )}
      <div className="overflow-hidden">
        <div>
          <HeroSection session={session} />
        </div>
      </div>
      {!session ? (
        <div className="overflow-hidden rounded-lg">
          <div className="px-4 py-2 sm:px-6">
            <h1 className="text-vdcRed text-lg lg:text-xl">How do I play?</h1>
          </div>
          <div className="px-2 py-2">
            <HowToPlay />
          </div>
        </div>
      ) : null}
      <Suspense fallback={<MatchNightRecapSkeleton />}>
        <MatchNightRecapLoader />
      </Suspense>
      <Suspense fallback={<RecentTransactionsSkeleton />}>
        <RecentTransactionsLoader />
      </Suspense>
      <div className="flex flex-col xl:flex-row 4xl:flex-col">
        <div className="overflow-hidden xl:w-3/4 4xl:w-full">
          <div className="px-4 py-2 mt-5 sm:px-6 text-lg lg:text-xl">
            <h1 className="">Latest News</h1>
          </div>
          <div className="px-4 py-2 sm:p-6">
            <Suspense
              fallback={
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
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
            <h1 className="text-lg lg:text-xl">
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
          <div className="px-4 py-2 sm:p-6">
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
          <div className="px-4 py-2 sm:px-6">
            <h1 className="text-lg lg:text-xl">more of our socials</h1>
          </div>
          <MediaSocials />
        </div>
      </div>
    </>
  );
}
