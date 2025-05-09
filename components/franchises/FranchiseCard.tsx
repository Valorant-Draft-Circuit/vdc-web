import { TEAM_LOGOS_URL } from "@/lib/common/constants";
import Image from "next/image";
import Link from "next/link";

export default function FranchiseCard({ franchise }: { franchise }) {
  const primaryColor = toCustomHexcode(franchise.primaryColor);
  const secondaryColor = toCustomHexcode(franchise.secondaryColor);

  return (
    <div
      className={`flex flex-row py-4 px-5 rounded-2xl drop-shadow-xl bg-gradient-to-br from-${primaryColor} to-${secondaryColor} hover:from-${secondaryColor} hover:to-${primaryColor} transition-colors duration-800`}
    >
      <Link href={`/about/franchises/${franchise.franchiseSlug}`}>
        <div className="flex flex-row gap-2 text-center">
          <div className="w-1/4 h-auto drop-shadow-lg">
            <Image
              src={`${TEAM_LOGOS_URL}${franchise.logo}`}
              alt={franchise.franchiseSlug}
              height={250}
              width={250}
            />
          </div>
          <h1 className="italic w-full text-xl my-auto drop-shadow-2xl text-vdcWhite">
            {franchise.franchiseSlug} | {franchise.name}
          </h1>
        </div>
      </Link>
    </div>
  );
}

function toCustomHexcode(color) {
  const hexcode = color.split("x")[1];
  console.log(hexcode);
  return `[#${hexcode}]`;
}
