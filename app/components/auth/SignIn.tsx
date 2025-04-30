import { signIn } from "@/lib/auth";

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
        className="bg-vdcRed px-5 py-1 text-sm font-semibold text-vdcWhite shadow-xs hover:bg-red-500 hover:cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
      >
        <h1 className="italic">Sign In</h1>
      </button>
    </form>
  );
}
