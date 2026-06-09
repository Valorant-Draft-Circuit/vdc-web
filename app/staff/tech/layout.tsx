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

  if (!hasAccess(userRoles, [Roles.LEAD_TECH])) {
    return <UnAuthorized />;
  }

  return (
    <div className="min-h-full">
      <div className="flex flex-col gap-5 py-10 px-5">
        <header>
          <div className="flex flex-row mx-auto max-w-7xl px-6 justify-between">
            <h1 className="text-3xl text-vdcRed">Tech Lead Page</h1>
          </div>
        </header>
        <main>
          <div className="mx-auto max-w-7xl px-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
