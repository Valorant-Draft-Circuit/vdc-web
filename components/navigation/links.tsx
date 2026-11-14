import {
  PlayIcon,
  CalendarDaysIcon,
  InformationCircleIcon,
  LinkIcon,
} from "@heroicons/react/24/solid";
import {
  BEHAVIOR_GUIDELINE_URL,
  RULEBOOK_URL,
} from "@/lib/common/constants/urls";
import { Roles } from "@/prisma/enums";
import { FM_ACCESS_LIST, MODERATION_ROLES } from "@/lib/common/constants/roles";

export const navLinks = [
  {
    name: "Season",
    icon: <CalendarDaysIcon />,
    links: [
      { name: "Schedule", href: "/schedule" },
      { name: "Standings", href: "/standings" },
      { name: "Playoffs", href: "/playoffs" },
      { name: "Stats", href: "/stats" },
      { name: "Players", href: "/player" },
      { name: "Franchises", href: "/franchises" },
    ],
  },
  {
    name: "Play",
    icon: <PlayIcon />,
    links: [
      { name: "Pick'ems", href: "/pickems" },
      { name: "Map Bans", href: "/mapbans" },
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
      {
        name: "FA Hub",
        href: "https://go.vdc.gg/fahub",
        ext: true,
      },
      {
        name: "Blog",
        href: "https://blog.vdc.gg",
        ext: true,
      },
    ],
  },
];

export const staffLinks = {
  name: "Staff",
  links: [
    { name: "Admin", href: "/staff/admin", roles: [Roles.ADMIN] },
    { name: "Tech", href: "/staff/tech", roles: [Roles.LEAD_TECH] },
    {
      name: "Moderation",
      href: "/staff/moderation",
      roles: MODERATION_ROLES,
    },
    {
      name: "Franchise Management",
      href: "/staff/franchise-management",
      roles: FM_ACCESS_LIST,
    },
  ],
};

export function getNavLinks(pickemEnabled: boolean) {
  if (pickemEnabled) {
    return navLinks;
  }
  return navLinks.map((navItem) => ({
    ...navItem,
    links: navItem.links.map((link) =>
      link.href === "/pickems" ? { ...link, href: "/pickems/about" } : link,
    ),
  }));
}
