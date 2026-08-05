import { Activity, CircleDot } from "lucide-react";

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
    <div className="min-w-0 border-white/10 px-4 py-3 first:pl-0 xl:border-l xl:first:border-l-0 xl:first:pl-4">
      <dt className="font-mono text-[0.51rem] tracking-[0.12em] text-[#657b81] uppercase">
        {label}
      </dt>
      <dd className="mt-1 truncate">
        <output className="font-mono text-xs font-semibold text-[#cbd8da]">
          {typeof value === "number"
            ? statusNumberFormatter.format(value)
            : (value ?? "Not Reported")}
          {value !== undefined && unit ? (
            <span className="ml-1 text-[0.58rem] font-normal text-[#71878c]">
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

  return (
    <footer
      aria-label="Mission telemetry status bar"
      className="sticky bottom-0 z-20 border-t border-white/10 bg-[#030b0f]/95 px-5 shadow-[0_-12px_35px_rgba(0,0,0,0.22)] backdrop-blur-xl sm:px-7"
    >
      <div className="flex items-center gap-3 border-b border-white/8 py-2 xl:hidden">
        <Activity aria-hidden="true" className="text-accent" size={13} />
        <span className="font-mono text-[0.54rem] tracking-[0.12em] text-[#758b90] uppercase">
          Persistent mission telemetry
        </span>
      </div>
      <div className="grid grid-cols-2 xl:grid-cols-[auto_repeat(5,minmax(0,1fr))] xl:items-center">
        <div className="hidden items-center gap-2 pr-4 xl:flex">
          <CircleDot
            aria-hidden="true"
            className="text-accent motion-safe:animate-pulse motion-reduce:animate-none"
            size={13}
          />
          <span className="font-mono text-[0.53rem] tracking-[0.12em] text-accent uppercase">
            Telemetry link
          </span>
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
      </div>
    </footer>
  );
}
