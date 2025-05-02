import { auth } from "@/lib/auth";
import DiscordButton from "../buttons/DiscordButton";
import Image from "next/image";
export default async function HeroSection() {
  const session = await auth();

  return (
    <div className="xl:p-4">
      <div className="relative isolate overflow-hidden py-28 xl:py-12 4xl:py-32 text-center xl:rounded-3xl sm:px-16 4xl:px-24 flex flex-col lg:flex-row space-y-10">
        <Image
          alt="hero image"
          src="/hero-section.webp"
          width={5000}
          height={5000}
          className="absolute inset-0 -z-10 size-full object-cover sm:object-top lg:object-[10%_10%] xl:scale-150 xl:absolute xl:left-20 xl:top-20 "
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-40 lg:hidden -z-10 transform-gpu overflow-hidden blur-3xl"
        >
          <div
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
            className="relative left-[calc(50%-7rem)] aspect-1155/678 w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-slate-800 to-black lg:left-[calc(50%-30rem)] lg:w-[72.1875rem]"
          />
        </div>
        <div className="bg-vdcBlack py-8 mx-2 rounded-2xl flex flex-col space-y-2 shadow-2xl lg:px-0 lg:px lg:ml-0 lg:justify-between lg:my-auto lg:max-w-8/12">
          <div className="flex flex-row items-end space-x-4 mx-10">
            <Image
              src="/vdc-flame.svg"
              alt="vdc flame"
              width={45}
              height={20}
            />
            <h2 className="text-vdcRed text-3xl">What is VDC?</h2>
          </div>
          <div className="px-10 text-start xl:w-96 lg:pr-8">
            <p className="text-white text-sm italic">
              VDC is an NA based, community run VALORANT league for all skill
              levels. We offer a casually competitive season based environment
              without the need to make a team of your own.
            </p>
          </div>
        </div>
        <div className="flex flex-col space-y-2 lg:my-auto lg:ml-auto">
          {!session ? (
            <>
              <h2 className="italic text-vdcRed lg:text-vdcBlack xl:text-vdcRed text-2xl">
                Join the Draft.
              </h2>
              <div>
                <DiscordButton text="Sign Up with Discord" />
              </div>
            </>
          ) : (
            <>
              <h2 className="italic text-vdcRed lg:text-vdcBlack xl:text-vdcRed text-2xl">
                {session.user?.name} has
                <br />
                Joined the Draft.
              </h2>
              <div></div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
