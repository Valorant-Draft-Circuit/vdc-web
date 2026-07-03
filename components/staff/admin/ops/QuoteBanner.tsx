import { pickRandomQuote } from "@/lib/common/quotes";

export default function QuoteBanner() {
  const quote = pickRandomQuote();

  return (
    <div className="rounded-lg border-l-2 border-vdcRed bg-white px-4 py-3 text-sm text-gray-600 shadow-xs dark:bg-vdcGrey dark:text-gray-300 italic">
      <p> &ldquo;{quote}&rdquo;</p>
    </div>
  );
}
