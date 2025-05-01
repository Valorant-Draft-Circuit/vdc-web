import { signIn } from "@/lib/auth";
import Image from "next/image";
export default function SignIn() {
  return (
    <form
      action={async () => {
        "use server";
        await signIn();
      }}
    >
      <button
        type="submit"
        className="flex flex-row  space-x-2 bg-vdcRed rounded-sm px-4 py-2 text-sm font-semibold text-vdcWhite shadow-xs hover:bg-red-500 hover:cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
      >
        <h1 className="italic">Sign In</h1>
        <Image
          src="/external/discord-logo.svg"
          alt="discord symbol"
          width={20}
          height={20}
        />
      </button>
    </form>
  );
}
