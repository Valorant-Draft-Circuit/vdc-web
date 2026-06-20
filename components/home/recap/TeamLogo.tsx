import Image from "next/image";
import { TEAM_LOGOS_URL } from "@/lib/common/constants";

export default function TeamLogo({
  logo,
  teamName,
}: {
  logo: string | null;
  teamName: string | null;
}) {
  if (!logo) return null;
  return (
    <span className="relative size-5 flex-none">
      <Image
        src={`${TEAM_LOGOS_URL}${logo}`}
        alt={teamName ?? "team logo"}
        fill
        className="object-contain"
      />
    </span>
  );
}
