import StatsTable from "@/components/stats/StatsTable";
import { getFormattedContracts } from "@/lib/queries/staff/FM";

export default async function Contracts() {
  const data = await getFormattedContracts();
  return <StatsTable data={data} />;
}
