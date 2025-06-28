import { Disclosure } from "@headlessui/react";
import Image from "next/image";
import Link from "next/link";
import ThemeSwitch from "../theme/ThemeSwitch";
import NavLinks from "./NavLinks";
import AuthSection from "../auth/AuthSection";
import SideBar from "./side/SideBar";
import {
  PlayIcon,
  InformationCircleIcon,
  LinkIcon,
} from "@heroicons/react/24/solid";
import { BEHAVIOR_GUIDELINE_URL, RULEBOOK_URL } from "@/lib/common/constants";
import { Roles } from "@/prisma";
import { FM_ACCESS_LIST } from "@/app/staff/franchise-management/layout";

export const navLinks = [
  {
    name: "Season",
    icon: <PlayIcon />,
    links: [
      { name: "Schedule", href: "/schedule" },
      { name: "Standings", href: "/standings" },
      { name: "Stats", href: "/stats" },
      { name: "Players", href: "/player" },
      { name: "Franchises", href: "/franchises" },
    ],
  },
  {
    name: "About",
    icon: <InformationCircleIcon />,
    links: [
      { name: "FAQ", href: "/about" },
      { name: "Rulebook", href: RULEBOOK_URL, ext: true },
      { name: "Guidelines", href: BEHAVIOR_GUIDELINE_URL, ext: true },
    ],
  },
  {
    name: "Links",
    icon: <LinkIcon />,
    links: [
      { name: "Discord", href: "https://go.vdc.gg/discord", ext: true },
      {
        name: "Youtube",
        href: "https://youtube.com/@ValorantDraftCircuit",
        ext: true,
      },
      {
        name: "Twitch",
        href: "https://twitch.tv/valorantdraftcircuit",
        ext: true,
      },
    ],
  },
];

export const staffLinks = {
  name: "Staff",
  links: [
    { name: "Admin", href: "/staff/admin", roles: [Roles.ADMIN] },
    {
      name: "Franchise Management",
      href: "/staff/franchise-management",
      roles: FM_ACCESS_LIST,
    },
    { name: "Tech", href: "/staff/tech", roles: [Roles.LEAD_TECH] },
  ],
};

export default function NavBar() {
  const preview = Boolean(process.env.PREVIEW);
  return (
    <>
      <Disclosure
        as="nav"
        className="bg-stone-950 hidden xl:block z-80 sticky top-0"
      >
        <div className="flex px-12 h-20 items-center justify-between 4xl:max-w-2/3 4xl:mx-auto 4xl:h-24">
          <div className="flex items-center justify-center">
            <div className="flex items-center">
              {/* TODO: set to custom homepage defined by user */}
              <Link href={"/"}>
                <Image
                  src="/main-logo.svg"
                  alt="Main logo"
                  width={150}
                  height={150}
                />
              </Link>
            </div>
            <NavLinks />
          </div>
          <div className="flex flex-row space-x-5 items-center 4xl:space-x-10">
            {!preview && <AuthSection />}
            <ThemeSwitch />
          </div>
        </div>
      </Disclosure>
      <SideBar />
    </>
  );
}
