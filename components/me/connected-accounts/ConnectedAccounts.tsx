import AccountList from "./AccountList";

export default async function ConnectedAccounts() {
  return (
    <div className="bg-gradient-to-b xl:bg-gradient-to-r from-vdcRed from-50% to-vdcWhite dark:to-vdcGrey to-50% py-8 mx-2 rounded-2xl flex flex-col xl:flex-row space-y-2 shadow-2xl lg:px-0 lg:px lg:ml-0 lg:justify-between lg:my-auto lg:max-w-12/12">
      <div className="flex flex-col w-full ">
        <div className="flex flex-col space-y-5 xl:items-end mx-10 xl:text-start ">
          <h1 className="italic text-3xl text-vdcBlack">Connected Accounts</h1>
          <h1 className="text-vdcWhite text-md italic text-wrap">
            TO LINK ANOTHER ACCOUNT, GO TO THE{" "}
            <a
              href="https://authenticate.riotgames.com"
              className="underline"
              target="_blank"
            >
              RIOT GAMES WEBSITE
            </a>{" "}
            AND LOG INTO THE ACCOUNT YOU WANT TO ADD, THEN CLICK THE + ICON
          </h1>
        </div>
        <div className="mx-10"></div>
      </div>
      <div className="px-auto sm:p-6 flex flex-col gap-2 w-full italic m-auto text-vdcRed transition-all">
        <AccountList />
      </div>
    </div>
  );
}
