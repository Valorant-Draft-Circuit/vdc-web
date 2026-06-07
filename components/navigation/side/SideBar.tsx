import MobileAuth from "../../auth/MobileAuth";
import SideLinks from "./SideLinks";

export default function SideBar() {
  const preview = Boolean(process.env.PREVIEW);

  return (
    <nav className="xl:hidden shadow-2xl">
      <div className="flex top-0 fixed z-50" id="slider">
        <SideLinks preview={preview} mobileAuth={<MobileAuth />} />
      </div>
    </nav>
  );
}
