import UnAuthorized from "@/components/auth/Unauthorized";
import { getUserRoles, hasAccess } from "@/lib/auth/access";
import { auth } from "@/lib/auth/auth";
import { Roles } from "@/prisma";

export const FM_ACCESS_LIST = [
  Roles.LEAGUE_GM,
  Roles.LEAGUE_AGM,
  Roles.TECH_NUMBERS,
  Roles.ADMIN,
];

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return <UnAuthorized />;

  const userRoles = await getUserRoles(userId);
  if (!userRoles) return <UnAuthorized />;

  if (!hasAccess(userRoles, FM_ACCESS_LIST)) {
    return <UnAuthorized />;
  }
  return <div>{children}</div>;
}
