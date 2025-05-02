"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import DropDown from "./DropDown";

const rulebook = "https://blog.vdc.gg/rulebook/";
const behaviorGuideline =
  "https://docs.google.com/spreadsheets/d/14wmSU43cB2xf9IOCuW0-74Ec8AXt6I6UGZHJhDNJJGc/edit?gid=0#gid=0";
const navigation = [
  {
    name: "Season",
    links: [
      { name: "Schedule", href: "/schedule" },
      { name: "Stats", href: "/stats" },
      { name: "Standings", href: "/standings" },
    ],
  },
  {
    name: "About",
    links: [
      { name: "FAQ", href: "/faq" },
      { name: "Franchises", href: "/franchises" },
      { name: "Rulebook", href: rulebook, ext: true },
      { name: "Guidelines", href: behaviorGuideline, ext: true },
    ],
  },
  {
    name: "Links",
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
  {
    name: "Staff",
    links: [
      {
        name: "Dashboard",
        href: "/staff/dashboard",
      },
      {
        name: "Management",
        href: "/staff/management",
      },
    ],
  },
];

export default function NavLinks() {
  const currentPath = usePathname();

  return (
    <div className="flex flex-col text-xl sm:ml-24 space-y-1">
      <div className="text-white italic">
        <Link
          href="/"
          className={
            currentPath === "/"
              ? "text-vdcRed"
              : "text-vdcWhite hover:text-vdcRed"
          }
        >
          <h1>VALORANT DRAFT CIRCUIT</h1>
        </Link>
      </div>

      <div className="hidden sm:flex space-x-10">
        {navigation.map((navItem) => (
          <DropDown
            key={navItem.name}
            title={navItem.name}
            links={navItem.links}
          />
        ))}
      </div>
    </div>
  );
}
