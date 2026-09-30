import { DataTable } from "@/components/ui/data-table";
import { formatRocketEngineCycle } from "@/features/rockets/utils";
import {
  basisNote,
  renderDualMeasurement,
} from "@/features/vehicles/components/measurement-display";
import { VehicleProfileSection } from "@/features/vehicles/components/vehicle-profile-section";
import type {
  ForceMeasurement,
  RocketEngine,
  RocketStage,
} from "@/features/vehicles/types";

interface PropulsionPanelProps {
  index?: number;
  name: string;
  stages: readonly RocketStage[];
}

interface EngineRow {
  readonly engine: RocketEngine;
  readonly stage: RocketStage;
}

/** A plain function, not a component, so the table formats the digits. */
function thrustCell(measurement: ForceMeasurement | undefined) {
  return measurement ? (
    renderDualMeasurement(measurement)
  ) : (
    <span className="font-sans text-muted">Not published</span>
  );
}

/**
 * Propulsion (spec 9): one row per engine type on each stage element. The
 * engine count and manufacturer sit under the engine name, and the thrust
 * columns come straight after it, so on a phone the figures are in view
 * without scrolling; the stage and cycle follow. Each thrust cell gives the
 * published figure, its conversion and the source's qualifier.
 */
export function PropulsionPanel({ index, name, stages }: PropulsionPanelProps) {
  const ordered = [...stages].sort((a, b) => a.stageNumber - b.stageNumber);
  const engineRows: EngineRow[] = ordered.flatMap((stage) =>
    stage.engines.map((engine) => ({ engine, stage })),
  );

  return (
    <VehicleProfileSection
      description="Thrust is per engine, where a figure is published. A rocket engine produces more thrust in vacuum because no outside air pressure acts against its exhaust."
      id="propulsion"
      index={index}
      title="Propulsion"
    >
      <DataTable
        singleLineCells
        caption={`${name} engines by stage`}
        columns={[
          {
            cell: ({ engine }) => (
              <>
                {engine.name}
                <span className="block text-sm font-normal text-muted">
                  {engine.quantity}{" "}
                  {engine.quantity === 1 ? "engine" : "engines"},{" "}
                  {engine.manufacturer}
                </span>
              </>
            ),
            header: "Engine",
            key: "engine",
          },
          {
            cell: ({ engine }) => thrustCell(engine.thrust.seaLevel),
            header: "Sea level",
            key: "sea-level",
            numeric: true,
          },
          {
            cell: ({ engine }) => thrustCell(engine.thrust.vacuum),
            header: "Vacuum",
            key: "vacuum",
            numeric: true,
          },
          { cell: ({ stage }) => stage.name, header: "Stage", key: "stage" },
          {
            cell: ({ engine }) => formatRocketEngineCycle(engine.cycle),
            header: "Cycle",
            key: "cycle",
          },
        ]}
        getRowKey={({ engine, stage }) => `${stage.id}-${engine.id}`}
        note={basisNote(
          engineRows.flatMap(({ engine }) => [
            engine.thrust.seaLevel,
            engine.thrust.vacuum,
          ]),
        )}
        rows={engineRows}
      />
    </VehicleProfileSection>
  );
}
