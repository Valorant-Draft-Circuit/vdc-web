import UnAuthorized from "@/components/auth/Unauthorized";
import { hasAccessToLink } from "@/lib/auth/access";
import { auth } from "@/lib/auth/auth";
import { Roles } from "@/prisma";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const userRole = session?.user?.roles || "";
  if (!hasAccessToLink(userRole, [Roles.LEAD_TECH])) {
    return <UnAuthorized />;
  }
  return <div>{children}</div>;
}
