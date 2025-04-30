"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { name: "Schedule", href: "/schedule" },
  { name: "Stats", href: "/stats" },
  { name: "Standings", href: "/standings" },
  { name: "RuleBook", href: "/rulebook" },
  { name: "Blog", href: "/blog" },
  { name: "FAQ", href: "/faq" },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function NavLinks() {
  const currentPath = usePathname();

  return (
    <div className="flex flex-col text-xl sm:ml-24 space-y-1">
      <div className="text-white italic">
        <Link
          href={"/"}
          className={classNames(
            currentPath === "/"
              ? "text-vdcRed"
              : "text-vdcWhite hover:text-vdcRed"
          )}
        >
          <h1>VALORANT DRAFT CIRCUIT</h1>
        </Link>
      </div>
      <div className="hidden sm:block">
        <div className="flex space-x-10">
          {navigation.map((item) => (
            <div
              key={item.name}
              className={classNames(
                currentPath === item.href
                  ? "text-vdcRed"
                  : "text-gray-300 hover:text-vdcRed",
                "text-sm"
              )}
            >
              <Link href={item.href}>
                <h1 className="italic">{item.name}</h1>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
