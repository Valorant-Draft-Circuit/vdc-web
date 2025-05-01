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
      <div className="flex px-12 h-20 items-center justify-between">
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
          <AuthButton />
          <ThemeSwitch />
        </div>
      </div>
    </Disclosure>
  );
}
