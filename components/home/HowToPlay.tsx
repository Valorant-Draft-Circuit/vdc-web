import Link from "next/link";
import DiscordButton from "../buttons/DiscordButton";
import { DISCORD_LINK } from "@/lib/common/constants";
const StepTitle = ({ children }: { children: React.ReactNode }) => (
  <h1 className="text-vdcWhite italic text-center mx-5 text-md xl:mx-0 xl:px-4">
    {children}
  </h1>
);

const StepDesc = ({ children }: { children: React.ReactNode }) => (
  <h1 className="text-vdcBlack dark:text-vdcWhite italic">{children}</h1>
);

const steps = [
  {
    step: 1,
    title: <StepTitle>Sign Up</StepTitle>,
    desc: (
      <StepDesc>
        Lets Start easy,
        <br />
        Join our{" "}
        <Link href={DISCORD_LINK} className="text-vdcRed underline">
          Discord!
        </Link>
      </StepDesc>
    ),
    button: true,
  },
  {
    step: 2,
    title: (
      <StepTitle>
        Connect your
        <br />
        Riot Account
      </StepTitle>
    ),
    desc: (
      <StepDesc>
        We analyze your
        <br />
        comp games and
        <br />
        assign you to a tier
      </StepDesc>
    ),
  },
  {
    step: 3,
    title: (
      <StepTitle>
        Get
        <br />
        Drafted!
      </StepTitle>
    ),
    desc: (
      <StepDesc>
        Enjoy the low
        <br />
        commitment, high quality
        <br />
        VALOARNT experience
      </StepDesc>
    ),
  },
  {
    step: 4,
    title: (
      <StepTitle>
        Additional
        <br />
        Questions?
      </StepTitle>
    ),
    desc: (
      <StepDesc>
        Check out our <br />
        <Link href="/about" className="text-vdcRed underline">
          FAQ
        </Link>
        <br />
        section.
      </StepDesc>
    ),
  },
];

export default function HowToPlay() {
  return (
    <div className="xl:flex 4xl:scale-125 4xl:pt-10">
      <div className="flex flex-col xl:flex-row xl:mx-auto overflow-auto">
        {steps.map(({ step, title, desc, button }) => (
          <div key={step} className="relative flex flex-col mx-8 py-3 mb-12">
            <div className="absolute z-10 bottom-42 w-full xl:-top-0">
              <div className="flex flex-row justify-between">
                <h1 className="text-vdcRed text-8xl italic xl:text-7xl drop-shadow-xl">
                  {step}
                </h1>
                <div className="bg-vdcRed rounded-lg px-5 py-3 drop-shadow-xl my-auto">
                  {title}
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-t dark:bg-vdcGrey dark:bg-none from-gray-200 to-transparent  mx-8 rounded-xl shadow-lg xl:w-72 xl:h-54 xl:mx-4">
              <div className="my-16 text-center xl:pt-2">
                {typeof desc === "string" ? (
                  <div className="text-vdcBlack italic text-lg">{desc}</div>
                ) : (
                  desc
                )}
                {button && (
                  <div className="mt-2">
                    <DiscordButton text="Discord" />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
