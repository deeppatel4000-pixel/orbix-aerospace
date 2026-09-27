import type {
  MissionProfileAnalysis,
  MissionReport,
  VehicleReentryEvaluationAnalysis,
} from "@/features/engineering-lab/types";
import { formatLabValue } from "./format-lab-value";

export interface MissionControlStatusBarProps {
  readonly missionProfileAnalysis?: MissionProfileAnalysis | null;
  readonly missionReport?: MissionReport | null;
  readonly vehicleReentryEvaluation?: VehicleReentryEvaluationAnalysis | null;
}

interface StatusBarItemProps {
  readonly label: string;
  readonly unit?: string;
  readonly value?: number | string;
}

function StatusBarItem({ label, unit, value }: StatusBarItemProps) {
  return (
    <div className="min-w-0 py-2">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="mt-0.5 break-words">
        <output
          className={
            value === undefined
              ? "text-sm text-muted"
              : typeof value === "number"
                ? "orbix-data text-foreground"
                : "text-sm text-foreground"
          }
        >
          {typeof value === "number"
            ? formatLabValue(value)
            : (value ?? "Not reported")}
          {value !== undefined && unit ? (
            <span className="ml-1 text-muted">{unit}</span>
          ) : null}
        </output>
      </dd>
    </div>
  );
}

/**
 * The key values for the loaded mission, repeated under every workspace.
 * These are computed results, not live data, so nothing here pulses or
 * claims a link state.
 */
export function MissionControlStatusBar({
  missionProfileAnalysis,
  missionReport,
  vehicleReentryEvaluation,
}: MissionControlStatusBarProps) {
  const missionName =
    missionReport?.missionSummary.missionName ??
    missionProfileAnalysis?.missionName;
  const systemsResolved =
    missionProfileAnalysis?.missionSummaryState.analysesResolved;
  const deltaV =
    missionReport?.orbitalAnalysis?.totalDeltaVMetresPerSecond ??
    missionProfileAnalysis?.totalDeltaVMetresPerSecond;
  const vehicleName =
    missionReport?.vehicleAnalysis?.selectedVehicle.vehicleName ??
    vehicleReentryEvaluation?.vehicle.vehicleName;
  const tpsMaterial =
    missionReport?.thermalAnalysis?.tpsRecommendation?.material.name ??
    vehicleReentryEvaluation?.summary.tps.recommendedMaterial.name;

  return (
    <footer
      aria-label="Mission summary"
      className="border-t border-border-subtle py-2"
    >
      <h3 className="sr-only">Mission summary: computed values</h3>
      <dl className="grid grid-cols-2 gap-x-6 sm:grid-cols-3 xl:grid-cols-5">
        <StatusBarItem label="Mission" value={missionName} />
        <StatusBarItem label="Analyses resolved" value={systemsResolved} />
        <StatusBarItem label="Delta-v" unit="m/s" value={deltaV} />
        <StatusBarItem label="Vehicle" value={vehicleName} />
        <StatusBarItem label="TPS" value={tpsMaterial} />
      </dl>
    </footer>
  );
}
