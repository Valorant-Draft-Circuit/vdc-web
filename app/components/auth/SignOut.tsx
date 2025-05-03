import { signOut } from "@/lib/auth";

export default function SignOut() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut();
      }}
    >
      <button
        type="submit"
        className="bg-vdcRed rounded-sm px-4 py-1 text-sm font-semibold text-vdcWhite shadow-xs hover:bg-red-500 hover:cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
      >
        <h1 className="italic 4xl:text-2xl">Sign Out</h1>
      </button>
    </form>
  );
}
