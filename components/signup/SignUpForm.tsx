"use client";

import {
  FormProvider,
  SubmitHandler,
  useForm,
  useFormContext,
} from "react-hook-form";
import Divider from "../theme/Divider";
import Accounts from "./Accounts";
import Questions from "./Questions";
import { Turnstile, TurnstileInstance } from "@marsidev/react-turnstile";
import { useRef, useState } from "react";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { LeagueStatus } from "@prisma/client";
import { UserWithRelations } from "@/lib/queries/user/user";

export type SignUpInput = {
  accountID: string;
  primaryValorantAccount: string;
  role: string;
  playedBefore: string;
  commit: string;
  reportedAccounts: string;
  readRules: string;
  rfaOnly: string;
};

export default function SignUpForm({
  user,
  signupState,
}: {
  user: UserWithRelations;
  signupState: string;
}) {
  const methods = useForm<SignUpInput>();
  if (user.Status!.leagueStatus !== LeagueStatus.UNREGISTERED) {
    return (
      <div className="flex flex-col text-center m-auto text-6xl gap-2 pt-10">
        <h1 className="text-vdcRed ">ALREADY SIGNED UP</h1>
        <h2 className="text-lg font-roboto italic">
          No need to sign up again. (woohoo!)
        </h2>
      </div>
    );
  }
  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(() => {})}>
        <div className="flex flex-col gap-1">
          <Divider title={"1. Account Info"} />
          <Accounts user={user} register={methods.register} />

          <Divider title={"2. Required Questions"} />
          <Questions
            register={methods.register}
            watch={methods.watch}
            signupState={signupState}
          />

          {methods.watch("readRules") === "true" && (
            <div>
              <Divider title={"3. Captcha"} />
              <SubmitSignUp />
            </div>
          )}

          <Divider title={"Need Help? Have Questions?"} />
          <h2 className="text-vdcRed">
            Please look around our&nbsp;
            <a
              target="_blank"
              href="https://discord.com/channels/963274331251671071/1047026533467967549"
              className="text-[#5865F2] underline hover:text-blue-600"
            >
              Help Channel
            </a>
            &nbsp;if you have any Questions!
          </h2>
        </div>
      </form>
    </FormProvider>
  );
}

async function handleRegistration(data: SignUpInput) {
  const res = await fetch("/api/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return res.ok;
}

function SubmitSignUp() {
  enum CAPTCHA_STATUS {
    "ERROR",
    "SOLVED",
    "EXPIRED",
  }
  const ref = useRef<TurnstileInstance | null>(null);
  const [status, setStatus] = useState<CAPTCHA_STATUS | null>(null);
  const [loading, setLoading] = useState(false);

  const { handleSubmit } = useFormContext<SignUpInput>();

  const onSubmit: SubmitHandler<SignUpInput> = async (data) => {
    setLoading(true);
    const ok = await handleRegistration(data);
    setLoading(false);

    if (ok) {
      alert("Successfully signed up!");
      window.location.href = "/";
    } else {
      alert(
        "Something went wrong :( Please try again or contact the VDC Admins/Tech."
      );
      ref.current?.reset();
      setStatus(null);
    }
  };

  return (
    <>
      <div className="flex flex-row gap-2">
        <Turnstile
          siteKey="0x4AAAAAAALpf4cDrG3xTBbw"
          ref={ref}
          onError={() => setStatus(CAPTCHA_STATUS.ERROR)}
          onExpire={() => ref.current?.reset()}
          onSuccess={() => setStatus(CAPTCHA_STATUS.SOLVED)}
        />
        {status === CAPTCHA_STATUS.ERROR && (
          <button
            type="button"
            className="my-auto rounded-md bg-orange-500 px-3.5 py-2.5 text-sm font-semibold text-white"
            onClick={() => ref.current?.reset()}
          >
            Reset CAPTCHA
          </button>
        )}
      </div>

      <button
        disabled={status !== CAPTCHA_STATUS.SOLVED || loading}
        type="submit"
        onClick={handleSubmit(onSubmit)}
        className="inline-flex items-center gap-x-2 rounded-md bg-vdcRed px-3.5 py-2.5 text-sm text-white shadow-xs hover:brightness-90 disabled:cursor-not-allowed disabled:opacity-20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 hover:cursor-pointer"
      >
        {loading ? (
          <h1 className="animate-pulse">Signing Up...</h1>
        ) : (
          <>
            <CheckCircleIcon aria-hidden="true" className="-ml-0.5 size-5" />
            <h1>Sign Up!</h1>
          </>
        )}
      </button>
    </>
  );
}
