export default function Divider({ title }: { title }) {
  return (
    <div className="relative">
      <div aria-hidden="true" className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-300" />
      </div>
      <div className="relative flex justify-start">
        <h1 className="bg-vdcWhite dark:bg-vdcBlack pr-3 text-base font-semibold text-vdcGrey dark:text-vdcWhite">
          {title}
        </h1>
      </div>
    </div>
  );
}
