import HeroSection from "./components/home/HeroSection";
import HowToPlay from "./components/home/HowToPlay";
import News from "./components/home/News";

export default function Home() {
  return (
    <>
      <div className="overflow-hidden">
        <div>
          <HeroSection />
        </div>
      </div>
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
      <div className="flex flex-col lg:flex-row">
        <div className="overflow-hidden">
          <div className="px-4 py-2 sm:px-6 text-lg lg:text-xl">
            <h1 className="italic">Latest News</h1>
          </div>
          <div className="px-4 py-2 sm:p-6">
            <News />
          </div>
        </div>
        <div className="overflow-hidden">
          <div className="px-4 py-2 sm:px-6">
            <h1 className="italic text-lg lg:text-xl">Media</h1>
          </div>
          <div className="px-4 py-2 sm:p-6">{/* Content goes here */}</div>
        </div>
      </div>
    </>
  );
}
