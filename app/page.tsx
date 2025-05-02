import { auth } from "@/lib/auth";
import HeroSection from "./components/home/HeroSection";
import HowToPlay from "./components/home/HowToPlay";
import News from "./components/home/News";
import { CHANNEL_URL, getLatestYouTubeVideo } from "@/lib/youtube";
import Link from "next/link";

export default async function Home() {
  const session = await auth();
  const mostRecentVideo = await getLatestYouTubeVideo();
  return (
    <>
      <div className="overflow-hidden">
        <div>
          <HeroSection />
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
      <div className="flex flex-col xl:flex-row">
        <div className="overflow-hidden xl:w-3/4">
          <div className="px-4 py-2 sm:px-6 text-lg lg:text-xl">
            <h1 className="italic">Latest News</h1>
          </div>
          <div className="px-4 py-2 sm:p-6">
            <News />
          </div>
        </div>
        <div className="overflow-hidden xl:w-1/2">
          <div className="px-4 py-2 sm:px-6">
            <h1 className="italic text-lg lg:text-xl">
              <Link href={CHANNEL_URL} className="hover:text-vdcRed">
                Latest Media
              </Link>
              <span className="text-vdcWhite dark:text-vdcBlack">
                (Hi GumbaYum!)
              </span>
            </h1>
          </div>
          <div className="px-4 py-2 sm:p-6 ">
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
        <div className="px-4 py-2 sm:px-6">
          <h1 className="text-vdcRed italic text-lg lg:text-xl">
            {/* TODO: Think of some other section, maybe stats? */}
          </h1>
        </div>
        <div className="px-2 py-2">{/* TODO: Think of something to put */}</div>
      </div>
    </>
  );
}
