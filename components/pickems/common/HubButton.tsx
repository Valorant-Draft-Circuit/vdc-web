import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/16/solid";

type Props = {
  href?: string;
};

export default function HubButton({ href = "/pickems" }: Props) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-vdcGrey transition-colors hover:cursor-pointer hover:border-vdcGrey hover:text-vdcBlack dark:border-gray-600 dark:text-gray-400 dark:hover:text-vdcWhite"
    >
      <ArrowLeftIcon className="size-4" />
      <h1>Hub</h1>
    </Link>
  );
}
