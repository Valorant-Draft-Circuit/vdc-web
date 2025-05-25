import FlameLogo from "../theme/FlameLogo";
import Link from "next/link";

export default function SignUpButton() {
  return (
    <Link href={"/signup"}>
      <div className="inline-flex text-md items-center gap-x-2 rounded-md bg-vdcRed px-5 py-2.5 font-semibold text-white shadow-xs hover:bg-red-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600">
        <FlameLogo className="-ml-0.5 size-5" color={"#FFFFFF"} />
        <h1>Sign Up</h1>
      </div>
    </Link>
  );
}
