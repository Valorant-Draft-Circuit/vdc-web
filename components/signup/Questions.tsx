"use client";

import { UseFormRegister, UseFormWatch } from "react-hook-form";
import { ISignUpInput } from "./SignUpForm";

export default function Questions({
  register,
  watch,
}: {
  season;
  register: UseFormRegister<ISignUpInput>;
  watch: UseFormWatch<ISignUpInput>;
}) {
  const reqQuestions = [
    {
      id: "role",
      type: "radio",
      label: (
        <>
          <h2>
            Do you want to sign up to be drafted on a team?
            <br /> Or just join the league as a sub who{" "}
            <span className="text-vdcRed">CANNOT</span> be signed?
          </h2>
          <p className="text-xs xl:text-sm">
            DE: a player who can be drafted at the start of the season, and
            later converted to a Free Agent if they get cut at any time during
            the season.
            <br />
            RFA: A free agent with some restrictions. This player cannot be
            signed or drafted and cannot substitute for the same team 2 match
            days in a row.
          </p>
        </>
      ),
      options: [
        { value: "DE", label: "DE" },
        { value: "RFA", label: "RFA" },
      ],
      show: true,
      rules: { required: true },
    },
    {
      id: "commit",
      type: "radio",
      label: (
        <>
          <div>
            <h1 className="text-vdcRed text-lg">THIS IS IMPORTANT:</h1>
            <h2>
              Are you able to play 2 maps{" "}
              <span className="text-vdcRed">EVERY </span>Wednesday and Friday at{" "}
              {getLocalTime()} (9:00 PM EST)?
            </h2>
          </div>
        </>
      ),
      options: [
        { value: "Yes", label: "Yes" },
        { value: "No", label: "No" },
      ],
      show: watch("role") === "DE",
      rules: { required: true },
    },
    {
      id: "reportedAccounts",
      type: "radio",
      label: (
        <>
          <h2>
            Have you reported <span className="text-vdcRed">EVERY</span> Riot
            account you play on?
          </h2>
          <p className="text-xs xl:text-sm text-vdcRed">
            WARNING: If another account is found, there could be consequences.
            Please report all accounts.
          </p>
        </>
      ),
      options: [
        { value: "Yes", label: "Yes" },
        { value: "No", label: "No" },
      ],
      show:
        watch("role") && (watch("role") === "RFA" || watch("commit") === "Yes"),
      rules: { required: true },
    },
    {
      id: "playedBefore",
      type: "radio",
      label: <h2>Have you played in VDC before?</h2>,
      options: [
        { value: "true", label: "Yes" },
        { value: "false", label: "No" },
      ],
      show: watch("reportedAccounts") === "Yes",
      rules: { required: true },
    },
    {
      id: "readRules",
      type: "radio",
      label: (
        <>
          <h2>
            Have you read all the rules of the league&nbsp;
            <a
              href="https://go.vdc.gg/rulebook"
              className="text-vdcRed underline hover:text-red-800"
              target="_blank"
            >
              RULEBOOK
            </a>
            ?
          </h2>
        </>
      ),
      options: [
        { value: "Yes", label: "Yes" },
        { value: "No", label: "No" },
      ],
      show:
        watch("reportedAccounts") === "Yes" &&
        (watch("playedBefore") === "false" || watch("playedBefore") === "true"),
      rules: { required: true },
    },
  ];

  function getLocalTime() {
    const localTime = new Date("2023-03-08T02:00:00Z").toLocaleTimeString(
      "en-US",
      { hour: "2-digit", minute: "2-digit" }
    );
    const tz = new Date()
      .toLocaleTimeString("en-us", { timeZoneName: "short" })
      .split(" ")[2];
    return localTime + " " + tz;
  }

  return (
    <div className="divide-y-1 divide-vdcGrey">
      {reqQuestions.map(
        (q) =>
          q.show && (
            <div key={q.id} className="py-2">
              <RadioGroup
                name={q.id}
                register={register}
                label={q.label}
                options={q.options}
                rules={q.rules}
              />
            </div>
          )
      )}
    </div>
  );
}

const RadioGroup = ({ name, register, label, options, rules }) => {
  return (
    <div className="flex flex-col gap-1">
      <label>
        <div className="flex flex-col gap-1 text-sm xl:text-md">{label}</div>
      </label>
      {options.map((option) => (
        <label key={option.value} className="flex flex-row">
          <input
            {...register(name, rules)}
            type="radio"
            value={option.value}
            className="mr-2 checked:bg-vdcRed focus:ring-vdcRed"
          />
          <h1 className="text-sm">{option.label}</h1>
        </label>
      ))}
    </div>
  );
};
