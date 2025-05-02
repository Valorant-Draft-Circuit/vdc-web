import { Disclosure } from "@headlessui/react";
import Image from "next/image";
import Link from "next/link";
import ThemeSwitch from "../theme/ThemeSwitch";
import NavLinks from "./NavLinks";
import AuthSection from "../auth/AuthSection";

export default function NavBar() {
  return (
    <Disclosure
      as="nav"
      className="bg-stone-950 hidden xl:block z-10 sticky top-0"
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
        <div className="flex flex-row space-x-5 items-center">
          <AuthSection />
          <ThemeSwitch />
        </div>
      </div>
    </Disclosure>
  );
}
