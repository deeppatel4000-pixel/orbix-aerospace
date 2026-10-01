import { DataTable } from "@/components/ui/data-table";
import { formatAircraftEngineType } from "@/features/aircraft/utils";
import {
  basisNote,
  renderDualMeasurement,
} from "@/features/vehicles/components/measurement-display";
import { VehicleProfileSection } from "@/features/vehicles/components/vehicle-profile-section";
import type {
  AircraftEngine,
  AircraftEngineThrust,
  AircraftPropulsion,
} from "@/features/vehicles/types";
import { formatCountWord } from "@/features/vehicles/utils/format-measurement";

interface PropulsionPanelProps {
  name: string;
  propulsion: AircraftPropulsion;
}

const thrustColumns: readonly {
  key: keyof AircraftEngineThrust;
  label: string;
}[] = [
  { key: "dry", label: "Dry thrust" },
  { key: "maximum", label: "Maximum thrust" },
  { key: "afterburner", label: "With afterburner" },
];

function describeEngines(name: string, engines: readonly AircraftEngine[]) {
  const list = engines.map(
    (engine) =>
      `${engine.quantity === 1 ? "a single" : formatCountWord(engine.quantity)} ${engine.manufacturer} ${engine.name} ${formatAircraftEngineType(engine.type).toLocaleLowerCase("en-US")}${engine.quantity === 1 ? "" : "s"}`,
  );

  return `The ${name} is powered by ${list.join(" and ")}. Thrust figures in the table are per engine.`;
}

/**
 * Propulsion (spec 9): one sentence, then the engine spec sheet. The
 * quantity and manufacturer sit under the engine name and the thrust
 * columns come straight after it, so on a phone the figures are in view
 * without scrolling; the engine type follows (below 40rem, under the
 * engine name).
 */
export function PropulsionPanel({ name, propulsion }: PropulsionPanelProps) {
  const engines = propulsion.engines;
  // Only the thrust ratings some engine publishes get a column.
  const columns = thrustColumns.filter((column) =>
    engines.some((engine) => engine.thrust[column.key]),
  );

  return (
    <VehicleProfileSection
      description={describeEngines(name, engines)}
      id="propulsion"
      title="Propulsion"
    >
      <DataTable
        singleLineCells
        caption={`${name} engines`}
        columns={[
          {
            // A designation such as "F119-PW-100" breaks at each hyphen in
            // the narrow sticky first column on a phone.
            cell: (engine) => (
              <>
                <span className="whitespace-nowrap">{engine.name}</span>
                <span className="block text-sm font-normal text-muted">
                  {engine.quantity}{" "}
                  {engine.quantity === 1 ? "engine" : "engines"},{" "}
                  {engine.manufacturer}
                </span>
              </>
            ),
            header: "Engine",
            key: "name",
          },
          ...columns.map((column) => ({
            cell: (engine: AircraftEngine) => {
              const measurement = engine.thrust[column.key];
              return measurement ? (
                renderDualMeasurement(measurement)
              ) : (
                <span className="font-sans text-muted">Not published</span>
              );
            },
            header: column.label,
            key: column.key,
            numeric: true,
          })),
          {
            cell: (engine) => formatAircraftEngineType(engine.type),
            // On a phone the type is set under the engine name.
            foldInto: "name",
            header: "Type",
            key: "type",
          },
        ]}
        getRowKey={(engine) => engine.id}
        note={basisNote(
          engines.flatMap((engine) =>
            thrustColumns.map((column) => engine.thrust[column.key]),
          ),
        )}
        rows={engines}
      />
    </VehicleProfileSection>
  );
}
