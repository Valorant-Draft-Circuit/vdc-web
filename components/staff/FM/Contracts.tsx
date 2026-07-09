import CommonTable from "@/components/theme/CommonTable";
import { getFormattedContracts } from "@/lib/queries/staff/FM";

export default async function Contracts() {
  const data = await getFormattedContracts();
  return <CommonTable data={data} exportName="vdc-contracts" />;
}
