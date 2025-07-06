import Link from "next/link";

export default function UnAuthorized() {
  return (
    <>
      <main className="grid place-items-center px-6 py-24 sm:py-32 lg:px-8">
        <div className="flex flex-col text-center m-auto gap-5">
          <h1 className="text-3xl font-semibold text-vdcRed ">401</h1>
          <h1 className="text-5xl font-semibold tracking-tight text-balance text-vdcRed sm:text-7xl">
            Unauthorized
          </h1>
          <p className="text-lg font-medium text-pretty text-gray-500 sm:text-xl/8">
            You are unauthorized to view this page.
          </p>
          <div className="flex flex-col items-center justify-center gap-5">
            <Link
              href="/"
              className="rounded-md bg-vdcRed px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-red-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
            >
              <h1>OK! Take me home</h1>
            </Link>
            <a
              href="https://discord.com/channels/963274331251671071/966924427709276160"
              className="text-sm hover:text-vdcRed hover:underline"
              target="_blank"
            >
              <h2>Contact the Admins if you believe this is an error</h2>
            </a>
          </div>
        </div>
      </main>
    </>
  );
}
