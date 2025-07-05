import { Control, Controller } from "react-hook-form";
import { SelectField, InputField } from "./Fields";
import { parseOptions, TConfigItem } from "./ControlPanelForm";

type ConfigSectionProps = {
  title: string;
  controls: TConfigItem[];
  control: Control;
  renderField?: (field, label, notes) => React.ReactNode;
};

export function ConfigSection({
  title,
  controls,
  control,
  renderField,
}: ConfigSectionProps) {
  return (
    <div className="rounded-md flex flex-col divide-y divide-vdcRed border-vdcRed">
      <h2 className="text-2xl pb-3">{title}</h2>
      <div className="space-y-6 p-6 grid grid-cols-1 xl:grid-cols-2 gap-x-10 gap-y-2">
        {controls.map(({ label, notes }) => {
          const options = parseOptions(notes);

          return (
            <div key={label}>
              <Controller
                name={label}
                control={control}
                render={({ field }) => {
                  if (renderField) {
                    const override = renderField(field, label, notes);
                    if (override != null) return <>{override}</>;
                  }

                  if (options) {
                    return (
                      <SelectField
                        field={field}
                        label={label}
                        options={options}
                      />
                    );
                  } else {
                    return <InputField field={field} label={label} />;
                  }
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
