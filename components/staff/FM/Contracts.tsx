import CommonTable from "@/components/theme/CommonTable";
import { getFormattedContracts } from "@/lib/queries/staff/FM";
import { getAgentsCached } from "@/lib/common/cache";

export default async function Contracts() {
  const [data, agents] = await Promise.all([
    getFormattedContracts(),
    getAgentsCached(),
  ]);
  return <CommonTable data={data} agents={agents} exportName="vdc-contracts" />;
}
