import { DropDown } from "./DropDowns";
import { getNavLinks, staffLinks } from "./NavBar";
import HomeLink from "./HomeLink";
import { auth } from "@/lib/auth/auth";
import { getUserRoles, hasAccess } from "@/lib/auth/access";
import { getPickemEnabled } from "@/lib/queries/pickems/getAdvanceBoard";

export default async function NavLinks() {
  const session = await auth();
  const isLoggedIn = !!session?.user;
  let userRoles = "";
  if (isLoggedIn && session?.user?.id) {
    userRoles = await getUserRoles(session.user.id);
  }
  const filteredStaffLinks = staffLinks.links.filter((link) =>
    hasAccess(userRoles, link.roles),
  );
  const visibleNavLinks = getNavLinks(await getPickemEnabled());

  return (
    <div className="flex flex-col text-xl sm:ml-24 space-y-1 ">
      <HomeLink />
      <div className="hidden sm:flex space-x-10">
        {visibleNavLinks.map((navItem) => (
          <DropDown
            key={navItem.name}
            title={navItem.name}
            links={navItem.links}
          />
        ))}
        {isLoggedIn && filteredStaffLinks.length > 0 && (
          <DropDown
            key={staffLinks.name}
            title={staffLinks.name}
            links={filteredStaffLinks}
          />
        )}
      </div>
    </div>
  );
}
