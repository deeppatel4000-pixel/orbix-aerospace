import { formatRocketPropellant } from "@/features/rockets/utils";
import { DataTable } from "@/features/vehicles/components/data-table";
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
        caption={`${name} stages`}
        columns={[
          { label: "Element" },
          { label: "Stage" },
          { label: "Propellants" },
          { label: "Engines" },
          { label: "Recovery" },
        ]}
        rows={ordered.map((stage) => ({
          cells: [
            <span className="whitespace-nowrap" key="stage">
              Stage {stage.stageNumber}
            </span>,
            formatRocketPropellant(stage.propellant),
            stage.engines
              .map((engine) => `${engine.quantity} × ${engine.name}`)
              .join(", "),
            stage.reusable ? "Designed for recovery" : "Expended",
          ],
          header: <span className="block min-w-40">{stage.name}</span>,
          key: stage.id,
        }))}
      />
    </VehicleProfileSection>
  );
}
