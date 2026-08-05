import { CheckCircle2, ClipboardList, Layers3 } from "lucide-react";

export interface BriefingOverviewProps {
  readonly analysesResolved: number;
  readonly purpose: string;
  readonly systems: readonly string[];
}

export function BriefingOverview({
  analysesResolved,
  purpose,
  systems,
}: BriefingOverviewProps) {
  return (
    <section aria-labelledby="mission-briefing-overview-title">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-accent">
          <ClipboardList aria-hidden="true" size={17} />
        </span>
        <div>
          <p className="font-mono text-[0.58rem] tracking-[0.16em] text-[#758c92] uppercase">
            Briefing frame // Supplied scope
          </p>
          <h3
            className="mt-0.5 text-xl font-semibold"
            id="mission-briefing-overview-title"
          >
            Mission Overview
          </h3>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(16rem,0.8fr)]">
        <article className="rounded-2xl border border-white/10 bg-[#081419]/90 p-5 sm:p-6">
          <p className="font-mono text-[0.6rem] tracking-[0.14em] text-accent uppercase">
            Mission purpose
          </p>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[#a6b8bc]">
            {purpose}
          </p>
        </article>

        <article className="rounded-2xl border border-white/10 bg-[#081419]/90 p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <p className="flex items-center gap-2 font-mono text-[0.6rem] tracking-[0.14em] text-accent uppercase">
              <Layers3 aria-hidden="true" size={14} />
              Mission systems
            </p>
            <output className="font-mono text-lg font-semibold text-accent">
              {analysesResolved}
            </output>
          </div>
          {systems.length > 0 ? (
            <ul className="mt-4 space-y-2.5">
              {systems.map((system) => (
                <li
                  className="flex items-center gap-2 text-sm text-[#c3d0d2]"
                  key={system}
                >
                  <CheckCircle2
                    aria-hidden="true"
                    className="shrink-0 text-accent"
                    size={15}
                  />
                  {system}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm leading-6 text-[#72878c]">
              Mission identity supplied; no optional analysis systems reported.
            </p>
          )}
        </article>
      </div>
    </section>
  );
}
