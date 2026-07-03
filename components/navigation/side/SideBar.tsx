import MobileAuth from "../../auth/MobileAuth";
import SideLinks from "./SideLinks";
import { getPickemEnabled } from "@/lib/queries/pickems/getAdvanceBoard";

export default async function SideBar() {
  const preview = Boolean(process.env.PREVIEW);
  const pickemEnabled = await getPickemEnabled();

  return (
    <nav className="xl:hidden shadow-2xl">
      <div className="flex top-0 fixed z-50" id="slider">
        <SideLinks
          preview={preview}
          pickemEnabled={pickemEnabled}
          mobileAuth={<MobileAuth />}
        />
      </div>
    </nav>
  );
}
