import { DISCORD_LINK } from "@/lib/common/constants";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import { Metadata } from "next";
import { matchDayTimeWithFallback } from "@/lib/common/times";

const faqs = [
  {
    question: "What is VDC?",
    answer:
      "We are an NA based, community run Valorant league for all skill levels. We offer a casual-competitive season-based environment without the need to make a team of your own.",
  },
  {
    question: "When are VDC match days?",
    answer:
      "VDC standard match days are every Wednesdays and Fridays at {{localtime}} during an ongoing season.",
  },
  {
    question: "What rank do I need to be?",
    answer:
      "All skill levels are welcome and able to play! We divide our players between skill-based tiers that include players ranging from Iron to Radiant. All Valorant players have a chance to play in a competitive and fun environment.",
  },
  {
    question: "How do I join a team?",
    answer:
      "After combines are completed, we hold a draft. Every player is drafted onto a team and will have an opportunity to tryout with their team to make a final roster spot. Pre-made teams may not enter.",
  },
  {
    question: "What are combines?",
    answer:
      "Combines are 5v5 in house games where your stats are recorded before the official season begins. They are scouting grounds for General Managers to see who they want to add to their teams.",
  },
  {
    question: "Can I join or play even if I can't commit to the match days?",
    answer:
      "Absolutely! There's an option to play as a restricted free agent and play as a sub for the season. Additionally we have an active LFG where you can join PUGs and 10mans! We also need people to help run our league. Have talents in media, tech, art, and others? Come join and talk to us!",
  },
  {
    question: "This sounds too good to be true... What's the catch?",
    answer:
      "That's the best part! There are none! There are no entry fees or costs. The only requirement to join is that you are willing to commit to the team that drafts you, and more importantly that you have fun.",
  },
];

export const metadata: Metadata = {
  title: "VDC | About",
  description: "About Valorant Draft Circuit",
};

export default async function Page() {
  return (
    <div>
      <div className="mx-auto max-w-7xl pb-10 xl:px-8 xl:py-12">
        <div className="mx-auto xl:max-w-4xl">
          <div className="relative xl:col-span-5 xl:rounded-3xl px-10 py-32 overflow-hidden xl:shadow-2xl">
            <Image
              alt="hero image"
              src="/about-hero-image.webp"
              width={5000}
              height={5000}
              className="absolute inset-0 -z-10 size-full object-cover sm:object-top lg:object-[10%_10%] brightness-20"
            />
            <h1 className="text-3xl italic font-semibold tracking-tight text-pretty text-vdcRed xl:text-4xl">
              Frequently asked questions
            </h1>
            <h2 className="mt-4 text-base/7 text-pretty text-vdcWhite">
              Can’t find the answer you’re looking for? Join our{" "}
              <a
                href={DISCORD_LINK}
                target="_blank"
                className="font-semibold text-vdcRed hover:text-red-500 italic underline"
              >
                discord
              </a>{" "}
              and reach out!
            </h2>
          </div>
          <dl className="mt-16 divide-y divide-gray-900/10 dark:divide-vdcGrey px-6">
            {faqs.map((faq) => (
              <Disclosure
                key={faq.question}
                as="div"
                className="py-6 first:pt-0 last:pb-0"
              >
                <dt>
                  <DisclosureButton className="group flex w-full items-start justify-between text-left text-vdcBlack dark:text-vdcWhite hover:translate-x-5 transition ease-in duration-75 hover:cursor-pointer">
                    <span className="text-base/7 italic">
                      <h1>{faq.question}</h1>
                    </span>
                    <span className="ml-6 flex h-7 items-center">
                      <ChevronDownIcon
                        aria-hidden="true"
                        className="size-6 transition-transform duration-200 group-data-open:rotate-180"
                      />
                    </span>
                  </DisclosureButton>
                </dt>
                <DisclosurePanel as="dd" className="mt-2 pr-12">
                  <p className="text-base/7 text-vdcBlack dark:text-vdcWhite">
                    {faq.answer.replace(
                      "{{localtime}}",
                      matchDayTimeWithFallback(),
                    )}
                  </p>
                </DisclosurePanel>
              </Disclosure>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
