import HeroSection from "./components/home/HeroSection";

export default function Home() {
  return (
    <>
      <div className="overflow-hidden">
        <div>
          <HeroSection />
        </div>
      </div>
      <div className="overflow-hidden rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h1 className="text-vdcRed italic lg:text-xl">How do I play?</h1>
        </div>
        <div className="px-4 py-5 sm:p-6">{/* Content goes here */}</div>
      </div>
      <div className="flex flex-row">
        <div className="overflow-hidden">
          <div className="px-4 py-5 sm:px-6 lg:text-xl">
            <h1 className="italic">Latest News</h1>
          </div>
          <div className="px-4 py-5 sm:p-6">{/* Content goes here */}</div>
        </div>
        <div className="overflow-hidden">
          <div className="px-4 py-5 sm:px-6">
            <h1 className="italic lg:text-xl">Media</h1>
          </div>
          <div className="px-4 py-5 sm:p-6">{/* Content goes here */}</div>
        </div>
      </div>
    </>
  );
}
