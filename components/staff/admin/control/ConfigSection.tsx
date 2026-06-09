import { Control, Controller, ControllerRenderProps } from "react-hook-form";
import { SelectField, InputField } from "./Fields";
import { parseOptions, ConfigItem } from "./ControlPanelForm";

type ConfigSectionProps = {
  title: string;
  controls: ConfigItem[];
  control: Control;
  renderField?: (
    field: ControllerRenderProps,
    label: string,
    notes: string,
  ) => React.ReactNode;
};

export function ConfigSection({
  title,
  controls,
  control,
  renderField,
}: ConfigSectionProps) {
  return (
    <div className="rounded-md border border-gray-200 dark:border-gray-400 p-3 flex flex-col divide-y dark:divide-gray-400">
      <h2 className="text-2xl pb-3 uppercase">{title}</h2>
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

export function ConfigSectionSkeleton() {
  const placeholders = Array.from({ length: 6 });
  return (
    <div className="rounded-md flex flex-col divide-y divide-gray-200 border border-gray-200 dark:divide-gray-400 dark:border-gray-400 animate-pulse">
      <div className="h-6 bg-gray-200 dark:bg-vdcGrey rounded w-1/3 m-4" />
      <div className="p-6 grid grid-cols-1 xl:grid-cols-2 gap-x-10 gap-y-6">
        {placeholders.map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-vdcGrey rounded w-1/2" />
            <div className="h-10 bg-gray-200 dark:bg-vdcGrey rounded w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
