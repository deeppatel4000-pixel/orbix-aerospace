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
      <h4
        className="orbix-h4 text-foreground"
        id="mission-briefing-overview-title"
      >
        Mission overview
      </h4>

      <div className="mt-3 grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(16rem,0.8fr)]">
        <div>
          <p className="orbix-label">Mission purpose</p>
          <p className="mt-1 max-w-[68ch] text-sm leading-6 text-text-secondary">
            {purpose}
          </p>
        </div>

        <div>
          <p className="orbix-label">
            Mission systems (
            <output className="orbix-data">{analysesResolved}</output> analyses
            resolved)
          </p>
          {systems.length > 0 ? (
            <ul className="mt-1 list-disc space-y-1 pl-5 text-sm leading-6 text-text-secondary">
              {systems.map((system) => (
                <li key={system}>{system}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-sm leading-6 text-muted">
              Mission identity supplied; no optional analysis systems reported.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
