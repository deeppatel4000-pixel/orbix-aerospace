import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Tag } from "@/components/ui/tag";
import { cn } from "@/lib/cn";
import { formatShowcaseNumber } from "@/features/showcase/components/format";
import {
  AllowanceBars,
  TransferOrbitDiagram,
} from "@/features/showcase/components/mission-diagrams";
import { ShowcaseSection } from "@/features/showcase/components/showcase-section";
import type { ShowcaseMission } from "@/features/showcase/data/mission-showcase";

interface MissionPresetsProps {
  readonly missions: readonly ShowcaseMission[];
}

export function PresetInputsTable({ mission }: { mission: ShowcaseMission }) {
  if (mission.inputGroups.length === 0) {
    return null;
  }

  return (
    <div
      aria-label={`${mission.preset.name} preset inputs`}
      className="orbix-table-wrap"
      role="region"
      tabIndex={0}
    >
      <table className="orbix-table w-full">
        <caption className="sr-only">
          Preset inputs for {mission.preset.name}
        </caption>
        <thead>
          <tr>
            <th scope="col">Input</th>
            <th className="orbix-num" scope="col">
              Value
            </th>
            <th scope="col">Unit</th>
          </tr>
        </thead>
        {mission.inputGroups.map((group) => (
          <tbody key={group.title}>
            <tr>
              <th
                className="bg-surface text-text-primary"
                colSpan={3}
                scope="rowgroup"
              >
                {group.title}
              </th>
            </tr>
            {group.rows.map((row) => (
              <tr key={row.label}>
                <th className="font-normal text-text-secondary" scope="row">
                  {row.label}
                </th>
                <td className="orbix-num text-text-primary">
                  {formatShowcaseNumber(row.value)}
                </td>
                <td className="orbix-table-unit">{row.unit}</td>
              </tr>
            ))}
          </tbody>
        ))}
      </table>
    </div>
  );
}

export function VehicleInputsTable({ mission }: { mission: ShowcaseMission }) {
  if (mission.vehicles.length === 0) {
    return null;
  }

  return (
    <div
      aria-label={`${mission.preset.name} vehicle inputs`}
      className="orbix-table-wrap"
      role="region"
      tabIndex={0}
    >
      <table className="orbix-table w-full">
        <caption className="sr-only">
          Vehicle inputs for {mission.preset.name}
        </caption>
        <thead>
          <tr>
            <th scope="col">Vehicle</th>
            <th className="orbix-num whitespace-nowrap" scope="col">
              Mass <span className="orbix-table-unit">(kg)</span>
            </th>
            <th className="orbix-num whitespace-nowrap" scope="col">
              Drag coefficient
            </th>
            <th className="orbix-num whitespace-nowrap" scope="col">
              Reference area <span className="orbix-table-unit">(m²)</span>
            </th>
            <th className="orbix-num whitespace-nowrap" scope="col">
              Nose radius <span className="orbix-table-unit">(m)</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {mission.vehicles.map((vehicle) => (
            <tr key={vehicle.vehicleName}>
              <th className="whitespace-nowrap" scope="row">
                {vehicle.vehicleName}
              </th>
              <td className="orbix-num">
                {formatShowcaseNumber(vehicle.massKilograms)}
              </td>
              <td className="orbix-num">
                {formatShowcaseNumber(vehicle.dragCoefficient)}
              </td>
              <td className="orbix-num">
                {formatShowcaseNumber(vehicle.referenceAreaSquareMetres)}
              </td>
              <td className="orbix-num">
                {formatShowcaseNumber(vehicle.noseRadiusMetres)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function MissionDiagramView({ mission }: { mission: ShowcaseMission }) {
  const { diagram } = mission;

  if (diagram.kind === "transfer") {
    return (
      <TransferOrbitDiagram diagram={diagram} missionId={mission.preset.id} />
    );
  }

  if (diagram.kind === "allowances") {
    return <AllowanceBars diagram={diagram} missionId={mission.preset.id} />;
  }

  return null;
}

/**
 * Diagram beside the input tables from 1024px. When only one of the two
 * exists it takes the row alone, with a readable maximum width.
 */
export function MissionBody({
  className,
  mission,
}: {
  className?: string;
  mission: ShowcaseMission;
}) {
  const hasDiagram = mission.diagram.kind !== "none";
  const hasTables =
    mission.inputGroups.length > 0 || mission.vehicles.length > 0;
  const split = hasDiagram && hasTables;

  return (
    <div
      className={cn(
        "grid gap-8",
        split && "lg:grid-cols-12 lg:gap-6",
        className,
      )}
    >
      {hasDiagram ? (
        <div className={split ? "lg:col-span-5" : "max-w-[40rem]"}>
          <MissionDiagramView mission={mission} />
        </div>
      ) : null}
      {hasTables ? (
        <div
          className={cn("grid content-start gap-4", split && "lg:col-span-7")}
        >
          <PresetInputsTable mission={mission} />
          <VehicleInputsTable mission={mission} />
        </div>
      ) : null}
    </div>
  );
}

function MissionPreset({ mission }: { mission: ShowcaseMission }) {
  const titleId = `mission-${mission.preset.id}-title`;
  return (
    <article
      aria-labelledby={titleId}
      className="border-t border-border-subtle py-8 first:border-t-0 first:pt-0"
    >
      <p className="orbix-label">{mission.categoryLabel}</p>
      <h3 className="orbix-h3 mt-1 text-text-primary" id={titleId}>
        {mission.preset.name}
      </h3>
      <p className="mt-2 max-w-[68ch] text-text-secondary">
        {mission.preset.description}
      </p>

      <ul aria-label="Systems used" className="mt-3 flex flex-wrap gap-2">
        {mission.includedSystems.map((system) => (
          <li key={system}>
            <Tag>{system}</Tag>
          </li>
        ))}
      </ul>

      <MissionBody className="mt-6" mission={mission} />

      <p className="mt-6">
        <Link
          className="orbix-link inline-flex items-center gap-1 text-sm"
          href={`/showcase-capture/${mission.preset.id}`}
        >
          Open the {mission.preset.name} presentation view
          <ArrowRight aria-hidden="true" size={14} />
        </Link>
      </p>
    </article>
  );
}

export function MissionPresets({ missions }: MissionPresetsProps) {
  return (
    <ShowcaseSection
      id="mission-presets"
      lead="The Engineering Lab ships five educational mission presets. Each one is a typed set of inputs, shown here converted to display units such as km; the diagrams are drawn from those numbers, with the calculators’ standard Earth radius setting the scale of the transfer drawings."
      title="Mission presets"
    >
      <div>
        {missions.map((mission) => (
          <MissionPreset key={mission.preset.id} mission={mission} />
        ))}
      </div>
    </ShowcaseSection>
  );
}
