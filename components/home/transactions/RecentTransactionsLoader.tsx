import {
  getRecentTransactionsCached,
  getSeasonCached,
} from "@/lib/common/cache";
import RecentTransactions from "./RecentTransactions";

export default async function RecentTransactionsLoader() {
  const season = await getSeasonCached();
  const groups = await getRecentTransactionsCached(season);
  if (!groups) return null;

  return <RecentTransactions groups={groups} />;
}
