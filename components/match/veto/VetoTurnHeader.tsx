export default function VetoTurnHeader({
  headline,
  children,
}: {
  headline: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-10 flex-row items-center justify-between gap-3">
      <h2>{headline}</h2>
      {children}
    </div>
  );
}
