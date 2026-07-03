import { signIn } from "@/lib/auth/auth";
import { DISCORD_LINK } from "@/lib/common/constants/urls";
import Image from "next/image";

type DiscordButtonProps = {
  text: string;
  signInButton: boolean;
};

export default function DiscordButton({
  text,
  signInButton,
}: DiscordButtonProps) {
  if (signInButton) {
    return (
      <>
        <form
          action={async () => {
            "use server";
            await signIn("discord", { redirectTo: "/" });
          }}
        >
          <button
            type="submit"
            className="flex flex-row m-auto space-x-5 rounded-lg bg-[#5865F2] px-3.5 py-3 text-sm font-semibold text-white hover:bg-[#626eee] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 hover:cursor-pointer "
          >
            <Image
              src="/external/discord-logo.svg"
              alt="discord symbol"
              width={45}
              height={45}
              className="my-auto"
            />
            <div className="font-discord max-w-32 my-auto text-center break-words font-extralight">
              {text}
            </div>
          </button>
        </form>
      </>
    );
  }
  return (
    <>
      <a href={DISCORD_LINK} target="_blank" rel="noopener noreferrer">
        <button
          type="submit"
          className="flex flex-row m-auto space-x-5 rounded-lg bg-[#5865F2] px-3.5 py-3 text-sm font-semibold text-white hover:bg-[#626eee] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 hover:cursor-pointer "
        >
          <Image
            src="/external/discord-logo.svg"
            alt="discord symbol"
            width={45}
            height={45}
            className="my-auto"
          />
          <div className="font-discord max-w-32 my-auto text-center break-words font-extralight">
            {text}
          </div>
        </button>
      </a>
    </>
  );
}
