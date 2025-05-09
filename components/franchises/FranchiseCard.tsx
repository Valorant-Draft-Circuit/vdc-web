import { TEAM_LOGOS_URL } from "@/lib/common/constants";
import Image from "next/image";
import Link from "next/link";

export default function FranchiseCard({ franchise }: { franchise }) {
  const primary = toHexcode(franchise.Brand.colorPrimary);
  const secondary = toHexcode(franchise.Brand.colorSecondary);

  return (
    <div
      style={{ "--p": primary, "--s": secondary } as React.CSSProperties}
      className="flex flex-row py-4 px-5 rounded-2xl h-28 xl:m-auto xl:h-98 xl:w-68 xl:justify-center items-center drop-shadow-xl bg-gradient-to-tl from-[var(--p)] to-[var(--s)] hover:via-[#ffffff] hover:from-[var(--s)] hover:to-[var(--p)] transition-colors duration-900 ease-in-out"
    >
      <div className="absolute inset-0 bg-black/40 rounded-2xl pointer-events-none transition-opacity duration-800" />
      <Link href={`/about/franchises/${franchise.slug}`}>
        <div className="flex flex-row gap-4 text-center xl:flex-col xl:gap-6">
          <div className="drop-shadow-lg flex">
            <Image
              src={`${TEAM_LOGOS_URL}${franchise.Brand.logo}`}
              alt={franchise.slug}
              height={250}
              width={250}
              className="w-24 h-auto xl:w-40 xl:mx-auto "
            />
          </div>
          <div className="flex flex-col text-start my-auto xl:text-center italic w-full text-md sm:m-auto drop-shadow-2xl text-vdcWhite">
            <h1 className="xl:hidden">{franchise.slug}</h1>
            <h1 className="text-lg xl:text-2xl">{franchise.name}</h1>
          </div>
        </div>
      </Link>
    </div>
  );
}

function toHexcode(color) {
  const colorHex = String(color).split("x")[1];
  return `#${colorHex}`;
}
