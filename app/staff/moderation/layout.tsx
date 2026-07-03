import UnAuthorized from "@/components/auth/Unauthorized";
import { getUserRoles, hasAccess } from "@/lib/auth/access";
import { auth } from "@/lib/auth/auth";
import { MODERATION_ROLES } from "@/lib/common/constants/roles";

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

  if (!hasAccess(userRoles, MODERATION_ROLES)) {
    return <UnAuthorized />;
  }
  return <div>{children}</div>;
}
