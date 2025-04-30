import { auth } from "@/lib/auth";
import SignIn from "./SignIn";
import Image from "next/image";
import SignOut from "./SignOut";
export default async function AuthButton() {
  const session = await auth();
  if (!session) return <SignIn />;
  const userAvatar = session?.user?.image;

  return (
    <div className="flex flex-row space-x-2">
      <div className="flex flex-col text-vdcWhite p-2 items-end text-sm ">
        <h1 className="italic">name</h1>
        <h2>team</h2>
      </div>
      <div className="flex m-auto">
        <Image
          alt="user avatar"
          src={userAvatar ?? ""}
          width={25}
          height={25}
          className="inline-block size-12 rounded-full"
        />
      </div>
      <div className="flex m-auto pl-4">
        <SignOut />
      </div>
    </div>
  );
}
