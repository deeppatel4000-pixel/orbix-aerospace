import { Activity, Check, CircleDot, FileCheck, Radar } from "lucide-react";

export type MissionControlStatus =
  "ready" | "analysis-complete" | "report-generated" | "visualization-active";

export interface MissionStatusPanelProps {
  readonly analysisAvailable: boolean;
  readonly reportAvailable: boolean;
  readonly visualizationAvailable: boolean;
}

const statusDefinitions = [
  {
    description: "Mission inputs are available for presentation.",
    icon: CircleDot,
    id: "ready",
    label: "Ready",
  },
  {
    description: "A completed mission-profile analysis was supplied.",
    icon: Check,
    id: "analysis-complete",
    label: "Analysis Complete",
  },
  {
    description: "A structured mission report was supplied.",
    icon: FileCheck,
    id: "report-generated",
    label: "Report Generated",
  },
  {
    description: "Mission visualization inputs are available.",
    icon: Radar,
    id: "visualization-active",
    label: "Visualization Active",
  },
] as const;

function resolveCurrentStatus({
  analysisAvailable,
  reportAvailable,
  visualizationAvailable,
}: MissionStatusPanelProps): MissionControlStatus {
  if (visualizationAvailable) return "visualization-active";
  if (reportAvailable) return "report-generated";
  if (analysisAvailable) return "analysis-complete";

  return "ready";
}

export function MissionStatusPanel(props: MissionStatusPanelProps) {
  const currentStatus = resolveCurrentStatus(props);
  const currentIndex = statusDefinitions.findIndex(
    (status) => status.id === currentStatus,
  );

  return (
    <section
      aria-labelledby="mission-status-title"
      className="overflow-hidden rounded-xl border border-white/10 bg-[#071116]"
      data-current-status={currentStatus}
    >
      <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div>
          <p className="font-mono text-[0.55rem] tracking-[0.15em] text-accent uppercase">
            Mission state // Supplied outputs
          </p>
          <h3
            className="mt-0.5 text-base font-semibold"
            id="mission-status-title"
          >
            Mission Status
          </h3>
        </div>
        <div className="flex items-center gap-2 font-mono text-[0.52rem] tracking-[0.12em] text-[#8da2a7] uppercase">
          <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_9px_rgba(91,205,190,0.48)]" />
          <span className="hidden sm:inline 2xl:hidden">
            {statusDefinitions[currentIndex]?.label}
          </span>
          <Activity aria-hidden="true" className="text-accent" size={15} />
        </div>
      </header>

      <ol
        aria-label="Mission processing status"
        className="grid divide-y divide-white/8 md:grid-cols-2 md:divide-y-0 2xl:grid-cols-1 2xl:divide-y 2xl:divide-white/8"
      >
        {statusDefinitions.map((status, index) => {
          const Icon = status.icon;
          const isCurrent = index === currentIndex;
          const isComplete = index < currentIndex;

          return (
            <li
              aria-current={isCurrent ? "step" : undefined}
              className={
                "relative grid min-h-16 grid-cols-[1.5rem_minmax(0,1fr)] items-center gap-2.5 px-4 py-2.5 md:border-b md:border-white/8 md:odd:border-r 2xl:border-r-0 2xl:border-b-0 2xl:odd:border-r-0 " +
                (isCurrent
                  ? "bg-accent/8"
                  : isComplete
                    ? "bg-white/[0.025]"
                    : "bg-transparent")
              }
              key={status.id}
            >
              {isCurrent ? (
                <span
                  aria-hidden="true"
                  className="absolute top-0 bottom-0 left-0 w-0.5 bg-accent"
                />
              ) : null}
              <span
                className={
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border " +
                  (isCurrent
                    ? "border-accent bg-accent/12 text-accent shadow-[0_0_12px_rgba(91,205,190,0.14)]"
                    : isComplete
                      ? "border-accent/35 bg-accent/5 text-accent"
                      : "border-white/10 bg-white/3 text-[#63777d]")
                }
              >
                <Icon aria-hidden="true" size={12} strokeWidth={1.8} />
              </span>
              <div className="min-w-0">
                <p
                  className={
                    "text-xs font-semibold tracking-[0.01em] " +
                    (isCurrent || isComplete
                      ? "text-[#e2ebec]"
                      : "text-[#778b90]")
                  }
                >
                  {status.label}
                </p>
                <p className="mt-0.5 text-[0.65rem] leading-4 text-[#74898f]">
                  {status.description}
                </p>
              </div>
            </li>
          );
        })}
      </ol>

      <p aria-live="polite" className="sr-only" role="status">
        Current mission presentation status:{" "}
        {statusDefinitions[currentIndex]?.label}.
      </p>
    </section>
  );
}
