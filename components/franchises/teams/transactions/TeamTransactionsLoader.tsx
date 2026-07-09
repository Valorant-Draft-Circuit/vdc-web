import TransactionRowItem from "@/components/home/transactions/TransactionRowItem";
import { getTeamTransactions } from "@/lib/queries/home/transactions";

export default async function TeamTransactionsLoader({
  teamId,
  season,
}: {
  teamId: number;
  season: number;
}) {
  const rows = await getTeamTransactions(teamId, season);

  return (
    <div className="rounded-md bg-slate-100 dark:bg-vdcGrey p-4 sm:p-5">
      <h2 className="text-sm tracking-wider uppercase font-semibold text-vdcRed mb-1">
        Transactions
      </h2>
      {rows.length === 0 ? (
        <h2 className="text-sm text-gray-500 dark:text-gray-400 py-1">
          No transactions this season
        </h2>
      ) : (
        <ul className="flex flex-col">
          {rows.map((row) => (
            <TransactionRowItem key={row.id} row={row} teamLinkTier={null} />
          ))}
        </ul>
      )}
    </div>
  );
}
