import { TEAM_LOGOS_URL } from "@/lib/common/constants";
import Image from "next/image";
import Link from "next/link";

export default function FranchiseCard({ franchise }: { franchise }) {
  const primary = toHexcode(franchise.Brand.colorPrimary);
  const secondary = toHexcode(franchise.Brand.colorSecondary);

  return (
    <div
      style={{ "--p": primary, "--s": secondary } as React.CSSProperties}
      className="
        flex flex-row py-4 px-5 rounded-2xl drop-shadow-xl
        bg-gradient-to-tl
        from-[var(--p)] to-[var(--s)]
        hover:from-[var(--s)] hover:to-[var(--p)]
        transition-colors duration-800
      "
    >
      <Link href={`/about/franchises/${franchise.slug}`}>
        <div className="flex flex-row gap-2 text-center">
          <div className="w-1/4 h-auto drop-shadow-lg">
            <Image
              src={`${TEAM_LOGOS_URL}${franchise.Brand.logo}`}
              alt={franchise.slug}
              height={250}
              width={250}
            />
          </div>
          <h1 className="italic w-full text-lg my-auto drop-shadow-2xl text-vdcWhite">
            {franchise.slug} | {franchise.name}
          </h1>
        </div>
      </Link>
    </div>
  );
}

function toHexcode(color) {
  const colorHex = String(color).split("x")[1];
  return `#${colorHex}`;
}