import Image from "next/image"
import { signIn } from '@/lib/auth'


export default function SignInPage() {
    async function handleSignIn() {
        'use server';
        await signIn('discord', { redirectTo: '/'})
    }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-vdcBlack">
      <div className="bg-vdcGrey shadow-lg rounded-xl p-10 text-center max-w-sm w-full">
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

      <footer className="mt-8 text-sm text-gray-500">
        Powered by{' '}
        <a
          href="https://next-auth.js.org/"
          className="underline"
          target="_blank"
        >
          NextAuth.js
        </a>
      </footer>
    </div>
  );
}
