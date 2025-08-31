import Image from "next/image"
import { signIn } from '@/lib/auth/auth'


export default function SignInPage() {
    async function handleSignIn() {
        'use server';
        await signIn('discord', { redirectTo: '/'})
    }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-vdcWhite dark:bg-vdcBlack">
      <div className="bg-vdcLtGrey dark:bg-vdcGray shadow-lg rounded-xl p-10 text-center max-w-sm w-full">
        <div className="flex justify-center mb-6">
          <Image
                alt="vdc fl"
                src="/vdc-flame.svg"
                width={90}
                height={40}
            />
        </div>
        <h1 className="text-2xl font-bold mb-2">Sign in With Discord</h1>
        <form action={handleSignIn}>
            <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg w-full"
            >
                Sign In with Discord
            </button>
        </form>
      </div>
    </div>
  );
}
