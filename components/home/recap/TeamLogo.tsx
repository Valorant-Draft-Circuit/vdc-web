import Image from "next/image";
import { TEAM_LOGOS_URL } from "@/lib/common/constants/urls";

export default function TeamLogo({
  logo,
  teamName,
  sizeClass = "size-5",
}: {
  logo: string | null;
  teamName: string | null;
  sizeClass?: string;
}) {
  if (!logo) return null;
  return (
    <span className={`relative flex-none ${sizeClass}`}>
      <Image
        src={`${TEAM_LOGOS_URL}${logo}`}
        alt={teamName ?? "team logo"}
        fill
        className="object-contain"
      />
    </span>
  );
}
