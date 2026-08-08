import { CircleDot } from "lucide-react";

import type {
  MissionProfileAnalysis,
  MissionReport,
  VehicleReentryEvaluationAnalysis,
} from "@/features/engineering-lab/types";

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

const statusNumberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

function StatusBarItem({ label, unit, value }: StatusBarItemProps) {
  return (
    <div className="min-w-40 shrink-0 border-l border-white/[0.07] px-4 py-3 xl:min-w-0 xl:border-l">
      <dt className="font-mono text-[0.49rem] tracking-[0.15em] text-[#657b81] uppercase">
        {label}
      </dt>
      <dd className="mt-1.5 truncate">
        <output className="font-mono text-[0.7rem] font-semibold tracking-[0.02em] text-[#d6e2e4]">
          {typeof value === "number"
            ? statusNumberFormatter.format(value)
            : (value ?? "Not Reported")}
          {value !== undefined && unit ? (
            <span className="ml-1 text-[0.55rem] font-normal tracking-[0.06em] text-[#71878c] uppercase">
              {unit}
            </span>
          ) : null}
        </output>
      </dd>
    </div>
  );
}

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
  const telemetryLinked = Boolean(
    missionProfileAnalysis || missionReport || vehicleReentryEvaluation,
  );
  const telemetryLabel = telemetryLinked ? "Linked" : "Standby";

  return (
    <footer
      aria-label="Mission telemetry status bar"
      className="relative z-20 border-t border-[#294451]/70 bg-[#02090d]/96 shadow-[0_-18px_44px_rgba(0,0,0,0.32)] backdrop-blur-xl xl:sticky xl:bottom-0"
    >
      <dl
        aria-label="Persistent mission telemetry. Scroll horizontally to review all reported values."
        className="flex [scrollbar-color:rgba(108,230,255,0.28)_transparent] overflow-x-auto px-1 outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset xl:grid xl:grid-cols-[10rem_repeat(5,minmax(0,1fr))] xl:items-center xl:overflow-visible xl:px-8"
        tabIndex={0}
      >
        <div className="flex min-w-40 shrink-0 items-center px-4 py-3 xl:min-w-0 xl:px-0 xl:pr-5">
          <dt className="sr-only">Persistent mission telemetry</dt>
          <dd className="flex items-center gap-2.5">
            <CircleDot
              aria-hidden="true"
              className={
                telemetryLinked
                  ? "text-accent motion-safe:animate-pulse motion-reduce:animate-none"
                  : "text-[#60767c]"
              }
              size={13}
            />
            <span
              className={
                "font-mono text-[0.53rem] tracking-[0.12em] uppercase " +
                (telemetryLinked ? "text-accent" : "text-[#71878c]")
              }
            >
              Telemetry // {telemetryLabel}
            </span>
          </dd>
        </div>
        <StatusBarItem label="Mission" value={missionName} />
        <StatusBarItem
          label="Systems resolved"
          unit="active"
          value={systemsResolved}
        />
        <StatusBarItem label="Delta-v" unit="m/s" value={deltaV} />
        <StatusBarItem label="Vehicle" value={vehicleName} />
        <StatusBarItem label="TPS" value={tpsMaterial} />
      </dl>
    </footer>
  );
}
