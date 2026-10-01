import { DataTable } from "@/components/ui/data-table";
import { formatRocketPropellant } from "@/features/rockets/utils";
import { VehicleProfileSection } from "@/features/vehicles/components/vehicle-profile-section";
import type { RocketStage } from "@/features/vehicles/types";

interface ArchitecturePanelProps {
  name: string;
  stages: readonly RocketStage[];
}

/**
 * Stages: one row per stage element in flight order. Parallel boosters share
 * a stage number with their core, so "Stage 1" can appear on two rows.
 */
export function ArchitecturePanel({ name, stages }: ArchitecturePanelProps) {
  const ordered = [...stages].sort((a, b) => a.stageNumber - b.stageNumber);

  return (
    <VehicleProfileSection
      description="Each stage element in flight order, with its propellants, engines and whether it is designed to be recovered."
      id="stages"
      title="Stages"
    >
      <DataTable
        singleLineCells
        caption={`${name} stages`}
        columns={[
          {
            cell: (stage) => (
              <span className="block md:min-w-40">{stage.name}</span>
            ),
            header: "Element",
            key: "element",
          },
          {
            cell: (stage) => stage.stageNumber,
            header: "Stage",
            key: "stage",
            numeric: true,
          },
          {
            cell: (stage) => formatRocketPropellant(stage.propellant),
            // On a phone propellants, engines and recovery are set under
            // the element name.
            foldInto: "element",
            header: "Propellants",
            key: "propellants",
          },
          {
            cell: (stage) =>
              stage.engines
                .map((engine) => `${engine.quantity} × ${engine.name}`)
                .join(", "),
            foldInto: "element",
            header: "Engines",
            key: "engines",
          },
          {
            cell: (stage) =>
              stage.reusable ? "Designed for recovery" : "Expended",
            foldInto: "element",
            header: "Recovery",
            key: "recovery",
          },
        ]}
        getRowKey={(stage) => stage.id}
        rows={ordered}
      />
    </VehicleProfileSection>
  );
}
