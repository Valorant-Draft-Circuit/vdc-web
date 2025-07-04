import UnAuthorized from "@/components/auth/Unauthorized";
import { hasAccess } from "@/lib/auth/access";
import { auth } from "@/lib/auth/auth";
import { Roles } from "@/prisma";

export const FM_ACCESS_LIST = [
  Roles.LEAGUE_GM,
  Roles.LEAGUE_AGM,
  Roles.TECH_NUMBERS,
];

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const userRole = session?.user?.roles || "";
  if (!hasAccess(userRole, FM_ACCESS_LIST)) {
    return <UnAuthorized />;
  }
  return <div>{children}</div>;
}
