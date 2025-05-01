import { signIn } from "@/lib/auth";
import Image from "next/image";

export default function DiscordButton() {
  return (
    <>
      <form
        action={async () => {
          "use server";
          await signIn();
        }}
      >
        <button
          type="submit"
          className="flex flex-row m-auto space-x-5 rounded-lg bg-[#5865F2] px-3.5 py-2.5 text-sm font-semibold text-white hover:bg-[#626eee] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 hover:cursor-pointer shadow-2xl"
        >
          <Image
            src="/external/discord-logo.svg"
            alt="discord symbol"
            width={45}
            height={45}
            className="my-auto"
          />
          <div className="font-discord">
            Sign Up <br />
            with Discord
          </div>
        </button>
      </form>
    </>
  );
}
