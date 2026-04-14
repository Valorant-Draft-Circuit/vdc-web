import UnAuthorized from "@/components/auth/Unauthorized";
import { getUserRoles, hasAccess } from "@/lib/auth/access";
import { auth } from "@/lib/auth/auth";
import { Roles } from "@/prisma";

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

  if (!hasAccess(userRoles, [Roles.ADMIN])) {
    return <UnAuthorized />;
  }
  return <div>{children}</div>;
}
