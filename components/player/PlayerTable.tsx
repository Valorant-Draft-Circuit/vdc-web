export default async function InvoicesTable({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
//   const players = await fetchFilteredPlayers(query, currentPage);
  return <h1>{query}</h1>;
}
