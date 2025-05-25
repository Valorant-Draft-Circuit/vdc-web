"use client";

import Link from "next/link";
import { Controller, useForm } from "react-hook-form";

export default function Questions({ season }: { season }) {
  const {
    register,
    // handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm();

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
      id: "seasonsPlayed",
      type: "checkbox",
      label: <h2>If so, what seasons?</h2>,
      options: Array.from({ length: season - 1 }, (_, i) => ({
        value: `Season ${season - 1 - i}`,
        label: `Season ${season - 1 - i}`,
      })),
      show:
        watch("reportedAccounts") === "Yes" && watch("playedBefore") === "true",
      rules: { required: watch("playedBefore") === "true" },
    },
    {
      id: "readRules",
      type: "radio",
      label: (
        <>
          <h2>
            Have you read all the rules of the league&nbsp;
            <Link
              href="https://go.vdc.gg/rulebook"
              className="text-vdcRed underline hover:text-red-800"
            >
              RULEBOOK
            </Link>
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
        (watch("playedBefore") === "false" ||
          (watch("playedBefore") === "true" &&
            watch("seasonsPlayed")?.length > 0)),
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
              {q.type === "radio" ? (
                <RadioGroup
                  name={q.id}
                  control={control}
                  label={q.label}
                  options={q.options}
                  rules={q.rules}
                />
              ) : (
                <CheckboxGroup
                  name={q.id}
                  register={register}
                  options={q.options}
                  label={q.label}
                />
              )}
              {errors[q.id] && (
                <span className="text-red-500">This question is required</span>
              )}
            </div>
          )
      )}
    </div>
  );
}

const RadioGroup = ({ name, control, label, options, rules }) => {
  return (
    <div className="flex flex-col gap-1">
      <label>
        <div className="flex flex-col gap-1 text-sm xl:text-md">{label}</div>
      </label>
      <Controller
        control={control}
        name={name}
        rules={rules}
        render={({ field }) =>
          options.map((opt) => (
            <label key={opt.value} className="flex flex-row">
              <input
                {...field}
                type="radio"
                value={opt.value}
                checked={field.value === opt.value}
                className="mr-2 checked:bg-vdcRed focus:ring-vdcRed"
              />
              <h1 className="text-sm">{opt.label}</h1>
            </label>
          ))
        }
      />
    </div>
  );
};

const CheckboxGroup = ({ name, register, label, options }) => (
  <div className="flex flex-col">
    <label>
      <div className="flex flex-col gap-1 text-sm xl:text-md">{label}</div>
    </label>
    {options.map((opt) => (
      <label key={opt.value} className="flex flex-row">
        <input
          {...register(name, { required: options.length > 0 })}
          type="checkbox"
          value={opt.value}
          className="mr-2 checked:bg-vdcRed focus:ring-vdcRed"
        />
        <p className="text-sm">{opt.label}</p>
      </label>
    ))}
  </div>
);
