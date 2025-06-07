import Image from "next/image"
import { signIn } from '@/lib/auth/auth'
import DiscordButton from "@/components/buttons/DiscordButton";


export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-vdcWhite dark:bg-vdcBlack">
      <div className="bg-vdcWhite dark:bg-vdcBlack shadow-lg rounded-xl p-10 text-center max-w-sm w-full">
        <div className="flex justify-center mb-6">
          <Image
                alt="vdc fl"
                src="/vdc-flame.svg"
                width={90}
                height={40}
            />
        </div>
        <h1 className="text-2xl font-bold mb-2">Sign in With Discord</h1>
        <div>
          <DiscordButton text="Sign In with Discord" signInButton={true} />
        </div>
      </div>
    </div>
  );
}
