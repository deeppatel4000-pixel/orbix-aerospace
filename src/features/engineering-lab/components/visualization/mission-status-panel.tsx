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
      className="overflow-hidden rounded-2xl border border-white/10 bg-[#071116]"
      data-current-status={currentStatus}
    >
      <header className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div>
          <p className="font-mono text-[0.6rem] tracking-[0.16em] text-accent uppercase">
            Mission state // Supplied outputs
          </p>
          <h3 className="mt-1 text-lg font-semibold" id="mission-status-title">
            Mission Status
          </h3>
        </div>
        <Activity aria-hidden="true" className="text-accent" size={18} />
      </header>

      <ol
        aria-label="Mission processing status"
        className="divide-y divide-white/8"
      >
        {statusDefinitions.map((status, index) => {
          const Icon = status.icon;
          const isCurrent = index === currentIndex;
          const isComplete = index < currentIndex;

          return (
            <li
              aria-current={isCurrent ? "step" : undefined}
              className={
                "relative flex items-start gap-3 px-5 py-4 transition-colors motion-reduce:transition-none " +
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
                  "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border " +
                  (isCurrent
                    ? "border-accent bg-accent/12 text-accent shadow-[0_0_16px_rgba(91,205,190,0.16)] motion-safe:animate-pulse"
                    : isComplete
                      ? "border-accent/35 bg-accent/5 text-accent"
                      : "border-white/10 bg-white/3 text-[#63777d]")
                }
              >
                <Icon aria-hidden="true" size={14} strokeWidth={1.8} />
              </span>
              <div>
                <p
                  className={
                    "text-sm font-semibold " +
                    (isCurrent || isComplete
                      ? "text-[#e2ebec]"
                      : "text-[#778b90]")
                  }
                >
                  {status.label}
                </p>
                <p className="mt-1 text-xs leading-5 text-[#74898f]">
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
