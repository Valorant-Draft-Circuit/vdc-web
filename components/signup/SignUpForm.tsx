"use client";

import { SubmitHandler, useForm } from "react-hook-form";
import Divider from "../theme/Divider";
import Accounts from "./Accounts";
import Questions from "./Questions";

export interface ISignUpInput {
  discordAccount: string;
  primaryValorantAccount: string;
  role: string;
  playedBefore: string;
  commit: string;
  reportedAccounts: string;
  readRules: string;
}

export default function SignUpForm({ user, currentSeason }) {
  const { register, handleSubmit, watch } = useForm<ISignUpInput>();
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Divider title={"Accounts"} />
      <Accounts user={user} register={register} />
      <Divider title={"Required Questions"} />
      <Questions season={currentSeason} register={register} watch={watch} />
    </form>
  );
}

const onSubmit: SubmitHandler<ISignUpInput> = (data) => {
  handleRegistration(data);
};

function handleRegistration(data) {
  fetch("/api/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  }).then(() => {
    window.location.href = "/";
  });
}
