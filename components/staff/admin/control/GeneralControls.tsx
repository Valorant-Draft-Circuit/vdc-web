import { Field, Label, Select, Input, Textarea } from "@headlessui/react";
import { Controller } from "react-hook-form";
import { parseOptions } from "./ControlPanelForm";

export default function GeneralControlPanel({
  generalControls,
  onSubmit,
  handleSubmit,
  control,
}) {
  return (
    <div className="rounded-md flex flex-col divide-y divide-vdcRed border-vdcRed">
      <h2 className="text-2xl pb-3">General League Controls</h2>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 p-6 grid grid-cols-1 xl:grid-cols-2 gap-x-10 gap-y-2"
      >
        {generalControls.map(({ label, notes }) => {
          const options = parseOptions(notes);
          console.log(options);

          return (
            <div key={label}>
              <Controller
                name={label}
                control={control}
                render={
                  ({ field }) =>
                    options ? (
                      <Field>
                        <Label className={"mb-1 uppercase text-vdcRed"}>
                          <h1>{label.replaceAll("_", " ")}</h1>
                        </Label>
                        <div>
                          <Select
                            name=""
                            className={
                              "w-full rounded-lg bg-gray-100 text-vdcBlack dark:bg-vdcBlack dark:text-vdcWhite px-3 py-1.5 focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2"
                            }
                          >
                            {options.map((option) => (
                              <option key={option} value={option}>
                                {option.replaceAll("_", " ")}
                              </option>
                            ))}
                          </Select>
                        </div>
                      </Field>
                    ) : isWelcomeMessage(label) ? (
                      <WelcomeMessageField field={field} label={label} />
                    ) : (
                      <Field>
                        <Label className={"mb-1 uppercase text-vdcRed"}>
                          <h1>{label.replaceAll("_", " ")}</h1>
                        </Label>
                        <div>
                          <Input
                            {...field}
                            className={
                              "w-full rounded-lg bg-gray-100 text-vdcBlack dark:bg-vdcBlack dark:text-vdcWhite px-3 py-1.5 focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2"
                            }
                          ></Input>
                        </div>
                      </Field>
                    )
                  //   (
                  //   <input
                  //     id={label}
                  //     {...field}
                  //     className="w-full p-2 border border-gray-300 rounded"
                  //   />
                  // )
                }
              />
              {/* {notes && <p className="text-sm mt-1">{notes}</p>} */}
            </div>
          );
        })}
      </form>
    </div>
  );
}

function isWelcomeMessage(label: string) {
  if (label.toLowerCase() === "welcome_message_title") {
    return true;
  }
  return false;
}

function WelcomeMessageField({ field, label }) {
  return (
    <Field>
      <Label className={"mb-1 uppercase text-vdcRed"}>
        <h1>{label.replaceAll("_", " ")}</h1>
      </Label>
      <div>
        <Textarea
          {...field}
          className={
            "w-full rounded-lg bg-gray-100 text-vdcBlack dark:bg-vdcBlack dark:text-vdcWhite px-3 py-1.5 focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2"
          }
        ></Textarea>
      </div>
    </Field>
  );
}
