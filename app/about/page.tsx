import getFaq from "@/lib/about/faq";
import { DISCORD_LINK } from "@/lib/constants";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import Link from "next/link";

export default async function Page() {
  const faqs = await getFaq();

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
              <Link
                href={DISCORD_LINK}
                className="font-semibold text-vdcRed hover:text-red-500 italic underline"
              >
                discord
              </Link>{" "}
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
                    {faq.answer}
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
