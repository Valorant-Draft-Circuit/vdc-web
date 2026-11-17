import MobileAuth from "../../auth/MobileAuth";
import SideLinks from "./SideLinks";
import { getPickemEnabled } from "@/lib/queries/pickems/getAdvanceBoard";
import { auth } from "@/lib/auth/auth";
import { getUserRoles } from "@/lib/auth/access";

export default async function SideBar() {
  const preview = Boolean(process.env.PREVIEW);
  const pickemEnabled = await getPickemEnabled();

  const session = await auth();
  const isLoggedIn = !!session?.user;
  let userRoles = "";
  if (isLoggedIn && session?.user?.id) {
    userRoles = await getUserRoles(session.user.id);
  }

  return (
    <nav className="xl:hidden shadow-2xl">
      <div className="flex top-0 fixed z-50" id="slider">
        <div className="h-dvh overflow-y-auto">
          <SideLinks
            preview={preview}
            pickemEnabled={pickemEnabled}
            userRoles={userRoles}
            mobileAuth={<MobileAuth />}
          />
        </div>
      </div>
    </nav>
  );
}
