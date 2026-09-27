import { formatRocketEngineCycle } from "@/features/rockets/utils";
import { DataTable } from "@/features/vehicles/components/data-table";
import { MeasurementValue } from "@/features/vehicles/components/measurement-value";
import { VehicleProfileSection } from "@/features/vehicles/components/vehicle-profile-section";
import type {
  ForceMeasurement,
  RocketEngine,
  RocketStage,
} from "@/features/vehicles/types";
import { formatQualifierLabel } from "@/features/vehicles/utils/format-measurement";

interface PropulsionPanelProps {
  name: string;
  stages: readonly RocketStage[];
}

function ThrustCell({ measurement }: { measurement?: ForceMeasurement }) {
  return measurement ? (
    <MeasurementValue measurement={measurement} />
  ) : (
    <span className="text-muted">Not published</span>
  );
}

/**
 * How the thrust figures were published, kept in its own column (as
 * MeasurementTable does) so the thrust cells stay narrow.
 */
function formatThrustBasis({ seaLevel, vacuum }: RocketEngine["thrust"]) {
  if (seaLevel && vacuum && seaLevel.qualifier !== vacuum.qualifier) {
    return `Sea level: ${formatQualifierLabel(seaLevel.qualifier)}. Vacuum: ${formatQualifierLabel(vacuum.qualifier)}`;
  }
  const measurement = seaLevel ?? vacuum;

  return measurement ? formatQualifierLabel(measurement.qualifier) : undefined;
}

/**
 * Propulsion (spec 14): one row per engine type on each stage element. The
 * engine count and manufacturer sit under the engine name rather than in
 * their own columns so the table fits the profile's main column without
 * scrolling.
 */
export function PropulsionPanel({ name, stages }: PropulsionPanelProps) {
  const ordered = [...stages].sort((a, b) => a.stageNumber - b.stageNumber);
  const engineRows = ordered.flatMap((stage) =>
    stage.engines.map((engine) => ({ engine, stage })),
  );

  return (
    <VehicleProfileSection id="propulsion" title="Propulsion">
      <p className="max-w-prose text-text-secondary">
        Each row names an engine, how many that stage element carries, and who
        builds it. The sea level and vacuum columns give thrust per engine where
        a figure is published, and the basis column says how each figure was
        published. A rocket engine produces more thrust in vacuum because no
        outside air pressure acts against its exhaust.
      </p>
      <div className="mt-6">
        <DataTable
          caption={`${name} engines by stage`}
          columns={[
            { label: "Engine" },
            { label: "Stage" },
            { label: "Cycle" },
            { label: "Sea level", numeric: true },
            { label: "Vacuum", numeric: true },
            { label: "Basis" },
          ]}
          rows={engineRows.map(({ engine, stage }) => {
            const basis = formatThrustBasis(engine.thrust);

            return {
              cells: [
                stage.name,
                formatRocketEngineCycle(engine.cycle),
                <ThrustCell key="sea" measurement={engine.thrust.seaLevel} />,
                <ThrustCell key="vacuum" measurement={engine.thrust.vacuum} />,
                <span className="text-muted" key="basis">
                  {basis ?? "Not published"}
                </span>,
              ],
              header: (
                <>
                  {engine.name}
                  <span className="block text-sm font-normal text-muted">
                    {engine.quantity}{" "}
                    {engine.quantity === 1 ? "engine" : "engines"},{" "}
                    {engine.manufacturer}
                  </span>
                </>
              ),
              key: `${stage.id}-${engine.id}`,
            };
          })}
        />
      </div>
    </VehicleProfileSection>
  );
}
