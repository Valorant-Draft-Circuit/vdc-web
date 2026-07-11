import { Metadata } from "next";
import HubButton from "@/components/pickems/common/HubButton";
import { getPickemEnabled } from "@/lib/queries/pickems/getAdvanceBoard";

export const metadata: Metadata = {
  title: "VDC | How Pick'ems work",
  description: "Rules and scoring for VDC Pick'ems.",
};

export default async function PickemsAboutPage() {
  const enabled = await getPickemEnabled();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">
          How PICK<b className="text-vdcRed">&apos;</b>EMS work
        </h1>
        {enabled && <HubButton />}
      </div>

      {!enabled && (
        <div className="rounded-xl border border-vdcRed/40 bg-vdcRed/10 px-4 py-3">
          <h2 className="text-sm font-bold text-vdcRed">
            Pick&apos;ems is not yet available
          </h2>
          <p className="mt-1 text-sm text-vdcBlack dark:text-vdcWhite">
            It&apos;s coming soon! Read here on how it will work once it goes
            live!
          </p>
        </div>
      )}

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-bold">Two ways to predict</h2>
        <p className="text-sm text-vdcBlack dark:text-vdcWhite">
          Pick&apos;ems has two prediction types, scored independently within
          each tier:
        </p>
        <ul className="ml-5 list-disc text-sm text-vdcBlack dark:text-vdcWhite">
          <li>
            <b>Match score picks</b>: for each match on a slate, predict the
            series score (e.g. 2-0, 1-1, 0-2).
          </li>
          <li>
            <b>Seeded advancement</b>: predict which teams make the playoff
            cutoff, in seed order (1 = top seed).
          </li>
          <li>
            <b>Playoff bracket</b>: once playoffs are seeded, fill out the
            whole bracket by typing each series score. The winner advances
            automatically.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-bold">Scoring</h2>
        <h1 className="text-sm font-bold text-vdcRed">Match picks</h1>
        <ul className="ml-5 list-disc text-sm text-vdcBlack dark:text-vdcWhite">
          <li>+0.2 for the correct winner (or correctly calling a draw)</li>
        </ul>
        <h1 className="mt-1 text-sm font-bold text-vdcRed">Advancement</h1>
        <ul className="ml-5 list-disc text-sm text-vdcBlack dark:text-vdcWhite">
          <li>+2 for each team you place in the playoff cutoff</li>
          <li>+1 more for each team whose exact seed you call</li>
        </ul>
        <h1 className="mt-1 text-sm font-bold text-vdcRed">Playoff bracket</h1>
        <ul className="ml-5 list-disc text-sm text-vdcBlack dark:text-vdcWhite">
          <li>
            Points per correct round winner scale by round: Round 1 (10-team
            brackets) 3, Quarterfinals 5, Semifinals 10, Final 20
          </li>
          <li>Calling the exact series score doubles that pick&apos;s points</li>
          <li>
            Your pick counts whenever your predicted team wins its real match
            in that round, even if their opponent differs from your bracket
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-bold">Locks</h2>
        <ul className="ml-5 list-disc text-sm text-vdcBlack dark:text-vdcWhite">
          <li>
            A slate locks at the first match of that match day. Edit your picks
            any time before then.
          </li>
          <li>
            Advancement locks at the first regular-season game of the tier,
            unless an admin sets a specific window.
          </li>
          <li>
            If you skip a pick on a slate you played, a random legal pick is
            filled in for you at lock, so you are never blank.
          </li>
          <li>
            The bracket locks 12 hours before the first playoff match. It must
            be submitted complete, and skipping it scores zero bracket points.
            There is no random fill.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-bold">Groups</h2>
        <p className="text-sm text-vdcBlack dark:text-vdcWhite">
          Create a private group and share its join code, or join one with a
          code. Each group has its own leaderboard. Groups are tied to a single
          season. Re-create and re-share next season.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-bold">Leaderboards</h2>
        <p className="text-sm text-vdcBlack dark:text-vdcWhite">
          View the Global board, a per-tier board, or any of your group boards.
          The Overall view averages your points across the tiers you played,
          so playing one tier or five is equally fair. A tier only counts
          toward your average once results have resolved in it, so joining a
          new tier mid-season never drops your standing before its matches are
          played. Ties are broken by match-winner accuracy.
        </p>
      </section>
    </div>
  );
}
