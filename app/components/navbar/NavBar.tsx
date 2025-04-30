import { Disclosure } from "@headlessui/react";
import Image from "next/image";
import Link from "next/link";
import ThemeSwitch from "../theme/ThemeSwitch";
import NavLinks from "./NavLinks";
import AuthButton from "../auth/AuthButton";

export default function NavBar() {
  return (
    <Disclosure
      as="nav"
      className="bg-black rounded-2xl mt-2 mx-2 hidden xl:block"
    >
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-20 items-center justify-between">
          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <div className="flex shrink-0 items-center">
              {/* TODO: set to custom homepage defined by user */}
              <Link href={"/"}>
                <Image
                  src="/Main Logo.svg"
                  alt="Main logo"
                  width={150}
                  height={150}
                />
              </Link>
            </div>
            <NavLinks />
          </div>
          <div className="flex flex-row space-x-5 items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            {/* AUTH SECTION + THEME GOES HERE */}
            <AuthButton />
            <ThemeSwitch />
          </div>
        </div>
      </div>
    </Disclosure>
  );
}
