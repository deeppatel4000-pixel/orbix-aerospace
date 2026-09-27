import { formatAircraftEngineType } from "@/features/aircraft/utils";
import { DataTable } from "@/features/vehicles/components/data-table";
import { MeasurementValue } from "@/features/vehicles/components/measurement-value";
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

/** Propulsion (spec 14): one sentence, then the engine table. */
export function PropulsionPanel({ name, propulsion }: PropulsionPanelProps) {
  const engines = propulsion.engines;
  // Only the thrust ratings some engine publishes get a column.
  const columns = thrustColumns.filter((column) =>
    engines.some((engine) => engine.thrust[column.key]),
  );

  return (
    <VehicleProfileSection id="propulsion" title="Propulsion">
      <p className="max-w-prose text-text-secondary">
        {describeEngines(name, engines)}
      </p>
      <div className="mt-6">
        <DataTable
          caption={`${name} engines`}
          columns={[
            { label: "Engine" },
            { label: "Manufacturer" },
            { label: "Type" },
            { label: "Quantity", numeric: true },
            ...columns.map((column) => ({
              label: column.label,
              numeric: true,
            })),
          ]}
          rows={engines.map((engine) => ({
            cells: [
              engine.manufacturer,
              formatAircraftEngineType(engine.type),
              engine.quantity,
              ...columns.map((column) => {
                const measurement = engine.thrust[column.key];
                return measurement ? (
                  <MeasurementValue
                    key={column.key}
                    measurement={measurement}
                    showQualifier
                  />
                ) : (
                  <span className="text-muted" key={column.key}>
                    Not published
                  </span>
                );
              }),
            ],
            header: engine.name,
            key: engine.id,
          }))}
        />
      </div>
    </VehicleProfileSection>
  );
}
