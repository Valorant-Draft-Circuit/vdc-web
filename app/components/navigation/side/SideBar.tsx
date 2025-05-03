// import AuthSection from "../../auth/AuthSection";
import SideLinks from "./SideLinks";

export default function SideBar() {
  return (
    <nav className="xl:hidden shadow-2xl">
      <div className="flex top-0 fixed z-20" id="slider">
        <SideLinks></SideLinks>
      </div>
    </nav>
  );
}
