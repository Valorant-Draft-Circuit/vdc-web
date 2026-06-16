"use client";

import {
  RegisterOptions,
  UseFormRegister,
  UseFormWatch,
} from "react-hook-form";
import { SignUpInput } from "./SignUpForm";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/16/solid";
import { BEHAVIOR_GUIDELINE_URL } from "@/lib/common/constants/urls";
import { getLocalMatchDayTime } from "@/lib/common/times";

export default function Questions({
  register,
  watch,
  signupState,
}: {
  register: UseFormRegister<SignUpInput>;
  watch: UseFormWatch<SignUpInput>;
  signupState: string;
}) {
  const rfaOnly = signupState === "RFA_ONLY";
  const reqQuestions = [
    {
      id: "role",
      type: "radio",
      label: (
        <>
          <h2>
            Do you want to sign up to be drafted on a team? or join the league
            as a sub who <span className="text-vdcRed">CANNOT</span> be signed?
          </h2>
          <RoleExplanations rfaOnly={rfaOnly} />
        </>
      ),
      options: [
        { value: "DE", label: "DE" },
        { value: "RFA", label: "RFA" },
      ],
      show: !rfaOnly,
      rules: { required: true },
    },
    {
      id: "rfaOnly",
      type: "radio",
      label: (
        <>
          <h2>
            Are you aware that you are signing up for VDC as an RFA, a sub that{" "}
            <span className="text-vdcRed">CANNOT</span> be signed?
          </h2>
          <RoleExplanations rfaOnly={rfaOnly} />
        </>
      ),
      options: [{ value: "rfaAck", label: "Yes" }],
      show: rfaOnly,
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
              {getLocalMatchDayTime()} (9:00 PM EST)?
            </h2>
          </div>
        </>
      ),
      options: [
        { value: "true", label: "Yes" },
        { value: "false", label: "No" },
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
          <h2 className="text-xs xl:text-sm text-vdcRed">
            WARNING: If another account is found, there could be consequences.
            Please report all accounts.
          </h2>
        </>
      ),
      options: [
        { value: "true", label: "Yes" },
        { value: "false", label: "No" },
      ],
      show:
        watch("rfaOnly") == "rfaAck" ||
        (watch("role") &&
          (watch("role") === "RFA" || watch("commit") === "true")),
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
      show: watch("reportedAccounts") === "true",
      rules: { required: true },
    },
    {
      id: "readRules",
      type: "radio",
      label: (
        <>
          <h2>
            Have you read through all of the{" "}
            <a
              href="https://go.vdc.gg/rulebook"
              className="text-vdcRed underline hover:text-red-800"
              target="_blank"
            >
              League Rulebook
            </a>{" "}
            and the{" "}
            <a
              href={BEHAVIOR_GUIDELINE_URL}
              className="text-vdcRed underline hover:text-red-800"
              target="_blank"
            >
              Behavioral Guidelines
            </a>
            ?
          </h2>
          <p className="text-xs">
            By signing up you hereby agree to abide by ALL of the league&apos;s
            rules/behavioral guidelines and will accept the consequences that
            come with for not adhereing to any and all of the rules.
          </p>
        </>
      ),
      options: [
        { value: "true", label: "Yes" },
        { value: "false", label: "No" },
      ],
      show:
        watch("reportedAccounts") === "true" &&
        (watch("playedBefore") === "false" || watch("playedBefore") === "true"),
      rules: { required: true },
    },
  ];

  return (
    <div className="divide-y divide-vdcGrey">
      {reqQuestions.map(
        (q) =>
          q.show && (
            <div key={q.id} className="py-2">
              <RadioGroup
                name={q.id as keyof SignUpInput}
                register={register}
                label={q.label}
                options={q.options}
                rules={q.rules}
              />
            </div>
          ),
      )}
    </div>
  );
}

type RadioOption = { value: string; label: string };

const RadioGroup = ({
  name,
  register,
  label,
  options,
  rules,
}: {
  name: keyof SignUpInput;
  register: UseFormRegister<SignUpInput>;
  label: React.ReactNode;
  options: RadioOption[];
  rules?: RegisterOptions<SignUpInput>;
}) => {
  return (
    <div className="flex flex-col gap-1">
      <label>
        <div className="flex flex-col gap-1 text-sm xl:text-md">{label}</div>
      </label>
      {options.map((option) => (
        <label key={option.value} className="flex flex-row gap-1">
          <input
            {...register(name, rules)}
            type="radio"
            value={option.value}
            className="relative size-4 my-auto appearance-none rounded-full border border-gray-300 bg-white before:absolute before:inset-1 before:rounded-full before:bg-white not-checked:before:hidden checked:border-red-600 checked:bg-vdcRed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:before:bg-gray-400 forced-colors:appearance-auto forced-colors:before:hidden"
          />
          <h1 className="text-sm">{option.label}</h1>
        </label>
      ))}
    </div>
  );
};

function RoleExplanations(props: { rfaOnly: boolean }) {
  const roleExplanations = [
    {
      id: "DE",
      name: "Draft Eligible",
      show: !props.rfaOnly,
      explanation:
        "a player who can be drafted at the start of the season, and later converted to a Free Agent if they get cut at any time during the season.",
    },
    {
      id: "RFA",
      name: "Restricted Free Agent",
      show: true,
      explanation:
        "A free agent with some restrictions: This player cannot be signed or drafted and cannot substitute for the same team 2 match days in a row.",
    },
  ];
  return (
    <dl className="divide-y divide-gray-900/10 dark:divide-vdcGrey">
      {props.rfaOnly ? (
        <h2 className="font-roboto text-vdcRed dark:text-gray-400">
          &quot;What does RFA mean?&quot;
        </h2>
      ) : (
        <h2 className="font-roboto text-vdcRed dark:text-gray-400">
          &quot;Whats the difference?!&quot;
        </h2>
      )}
      {roleExplanations.map(
        (role) =>
          role.show && (
            <Disclosure key={role.id} as="div" className="py-2">
              <dt>
                <DisclosureButton className="group flex w-full items-start justify-between text-left text-vdcBlack dark:text-vdcWhite hover:cursor-pointer">
                  <span className="my-auto ">
                    <h1>{role.id}</h1>
                  </span>
                  <span className="ml-6 flex h-7 items-center">
                    <ChevronDownIcon
                      aria-hidden="true"
                      className="size-6 transition-transform duration-200 group-data-open:rotate-180"
                    />
                  </span>
                </DisclosureButton>
              </dt>
              <DisclosurePanel
                as="dd"
                className="mt-2 pr-12 flex flex-row text-xs xl:text-sm"
              >
                <p className=" text-vdcBlack dark:text-vdcWhite">
                  <span className="font-bold">{role.name}</span>:{" "}
                  {role.explanation}
                </p>
              </DisclosurePanel>
            </Disclosure>
          ),
      )}
    </dl>
  );
}
