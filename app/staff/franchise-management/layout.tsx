import UnAuthorized from "@/components/auth/Unauthorized";
import { getUserRoles, hasAccess } from "@/lib/auth/access";
import { auth } from "@/lib/auth/auth";
import { FM_ACCESS_LIST } from "@/lib/common/constants/roles";

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
