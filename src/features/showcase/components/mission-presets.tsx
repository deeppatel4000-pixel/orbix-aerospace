import type { ReactNode } from "react";

import { ButtonLink } from "@/components/ui/button-link";
import { DataTable } from "@/components/ui/data-table";
import { cn } from "@/lib/cn";
import { formatShowcaseNumber } from "@/features/showcase/components/format";
import { keepCompounds } from "@/features/showcase/components/keep-compounds";
import {
  AllowanceBars,
  isPointScaleTransfer,
  TransferOrbitDiagram,
  type TransferDiagramSize,
} from "@/features/showcase/components/mission-diagrams";
import { ShowcaseSection } from "@/features/showcase/components/showcase-section";
import type {
  PresetInputRow,
  ShowcaseMission,
} from "@/features/showcase/data/mission-showcase";
import type { VehicleReentryConfiguration } from "@/features/engineering-lab/types";

interface MissionPresetsProps {
  readonly missions: readonly ShowcaseMission[];
}

/**
 * A visible caption plus the preset name for screen readers, so that each
 * table region on the page has a unique accessible name.
 */
function tableCaption(visible: string, mission: ShowcaseMission): ReactNode {
  return (
    <>
      {visible}
      <span className="sr-only">, {mission.preset.name}</span>
    </>
  );
}

/**
 * One `DataTable` per input group, each captioned with the group title.
 * `pair` sets two groups side by side from 48rem.
 */
function PresetInputsTable({
  mission,
  pair = false,
}: {
  mission: ShowcaseMission;
  pair?: boolean;
}) {
  if (mission.inputGroups.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "grid min-w-0 grid-cols-1 content-start gap-8",
        pair && mission.inputGroups.length > 1 && "md:grid-cols-2 md:gap-x-8",
      )}
    >
      {mission.inputGroups.map((group) => (
        <DataTable<PresetInputRow>
          caption={tableCaption(group.title, mission)}
          columns={[
            { cell: (row) => row.label, header: "Input", key: "input" },
            {
              cell: (row) => formatShowcaseNumber(row.value),
              header: "Value",
              key: "value",
              numeric: true,
            },
            {
              cell: (row) => (
                <span className="orbix-table-unit">{row.unit}</span>
              ),
              header: "Unit",
              key: "unit",
            },
          ]}
          getRowKey={(row) => row.label}
          key={group.title}
          rows={group.rows}
        />
      ))}
    </div>
  );
}

/**
 * Each header names its quantity on the first line and its unit on a
 * second, and every header cell sits on the bottom rule, so a one-line
 * header lines up with its two-line neighbours. Units keep their own case.
 */
const vehicleHeaderLines =
  "[&_thead_th]:align-bottom [&_thead_.orbix-table-unit]:block [&_thead_.orbix-table-unit]:normal-case";

function VehicleInputsTable({
  compact = false,
  mission,
}: {
  /** For the narrower capture column: vehicle names may wrap. */
  compact?: boolean;
  mission: ShowcaseMission;
}) {
  if (mission.vehicles.length === 0) {
    return null;
  }

  return (
    <DataTable<VehicleReentryConfiguration>
      caption={tableCaption("Vehicle inputs", mission)}
      className={cn(
        vehicleHeaderLines,
        // On the page the headers wrap below 1280px, so the table fits a
        // 768px column instead of scrolling. The capture column is narrower
        // still: there the headers always wrap and vehicle names may too.
        compact
          ? "[&_thead_th]:whitespace-normal"
          : "max-xl:[&_thead_th]:whitespace-normal",
      )}
      columns={[
        {
          cell: (vehicle) => (
            <span className={compact ? undefined : "whitespace-nowrap"}>
              {vehicle.vehicleName}
            </span>
          ),
          header: "Vehicle",
          key: "vehicle",
        },
        {
          cell: (vehicle) => formatShowcaseNumber(vehicle.massKilograms),
          header: "Mass",
          key: "mass",
          numeric: true,
          unit: "kg",
        },
        {
          cell: (vehicle) => formatShowcaseNumber(vehicle.dragCoefficient),
          header: "Drag coefficient",
          key: "drag",
          numeric: true,
        },
        {
          cell: (vehicle) =>
            formatShowcaseNumber(vehicle.referenceAreaSquareMetres),
          header: "Reference area",
          key: "area",
          numeric: true,
          unit: "m²",
        },
        {
          cell: (vehicle) => formatShowcaseNumber(vehicle.noseRadiusMetres),
          header: "Nose radius",
          key: "nose",
          numeric: true,
          unit: "m",
        },
      ]}
      getRowKey={(vehicle) => vehicle.vehicleName}
      rows={mission.vehicles}
    />
  );
}

function MissionDiagramView({
  mission,
  size,
}: {
  mission: ShowcaseMission;
  size?: TransferDiagramSize;
}) {
  const { diagram } = mission;

  if (diagram.kind === "transfer") {
    return (
      <TransferOrbitDiagram
        diagram={diagram}
        missionId={mission.preset.id}
        size={size}
      />
    );
  }

  if (diagram.kind === "allowances") {
    return <AllowanceBars diagram={diagram} missionId={mission.preset.id} />;
  }

  return null;
}

interface MissionBodyProps {
  /** Content set last in the text column, after the tables. */
  readonly after?: ReactNode;
  readonly className?: string;
  /** Content set last, across both columns. */
  readonly footer?: ReactNode;
  /** The preset's title block. It opens the text column. */
  readonly header: ReactNode;
  readonly mission: ShowcaseMission;
  /**
   * `page`: a 7 to 5 split from 1024px, the vehicle table across the full
   * width below. `capture`: a narrower figure column, the vehicle table in
   * the text column and `footer` across both, so the preset fits one
   * laptop screen.
   */
  readonly variant?: "capture" | "page";
}

/**
 * One template for every preset with a drawing. From 1024px the figure
 * holds the first column and the title block opens the second, level with
 * the top of the plate; the input tables and `after` follow the title.
 * Below 1024px the title comes first, then the figure, then the tables.
 * A preset without orbital geometry (reentry only) has no figure: the
 * title block and the entry conditions share the first row and the
 * vehicle table runs the full width below.
 * `footer` closes it.
 */
export function MissionBody({
  after,
  className,
  footer,
  header,
  mission,
  variant = "page",
}: MissionBodyProps) {
  const capture = variant === "capture";
  const { diagram } = mission;
  const size: TransferDiagramSize = capture
    ? "compact"
    : isPointScaleTransfer(diagram)
      ? "feature"
      : "standard";
  const sideInputs =
    diagram.kind !== "none" && mission.inputGroups.length > 0 ? (
      <PresetInputsTable mission={mission} pair={capture} />
    ) : null;
  const vehicles =
    mission.vehicles.length > 0 ? (
      <VehicleInputsTable compact={capture} mission={mission} />
    ) : null;
  const gap = capture ? "gap-5" : "gap-10";
  const column = cn("grid min-w-0 content-start max-lg:contents", gap);

  if (diagram.kind === "none") {
    return (
      <div className={cn("grid grid-cols-1", gap, className)}>
        <div
          className={cn(
            "grid grid-cols-1",
            gap,
            "lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-x-12 xl:gap-x-16",
          )}
        >
          <div className="min-w-0">{header}</div>
          <div className="grid min-w-0 content-start gap-10">
            <PresetInputsTable mission={mission} />
            {after}
          </div>
        </div>
        {vehicles}
        {footer}
      </div>
    );
  }

  return (
    <div className={cn("grid grid-cols-1", gap, className)}>
      <div
        className={cn(
          "grid grid-cols-1",
          gap,
          capture
            ? "lg:grid-cols-[21rem_minmax(0,1fr)] lg:gap-x-10 xl:grid-cols-[25rem_minmax(0,1fr)] xl:gap-x-14"
            : "lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-x-12 xl:gap-x-16",
        )}
      >
        <div className={cn(column, "lg:col-start-2 lg:row-start-1")}>
          <div className="min-w-0 max-lg:order-1">{header}</div>
          {sideInputs ? (
            <div className="min-w-0 max-lg:order-3">{sideInputs}</div>
          ) : null}
          {capture && vehicles ? (
            <div className="min-w-0 max-lg:order-3">{vehicles}</div>
          ) : null}
          {after ? <div className="min-w-0 max-lg:order-3">{after}</div> : null}
        </div>
        <div className={cn(column, "lg:col-start-1 lg:row-start-1")}>
          <div className="min-w-0 max-lg:order-2">
            <MissionDiagramView mission={mission} size={size} />
          </div>
        </div>
      </div>
      {capture ? null : vehicles}
      {footer}
    </div>
  );
}

function MissionPreset({ mission }: { mission: ShowcaseMission }) {
  const titleId = `mission-${mission.preset.id}-title`;
  const header = (
    <div className="max-w-[68ch]">
      <p className="orbix-caps text-accent">{mission.categoryLabel}</p>
      <h3 className="orbix-h3 mt-2 text-balance text-text-primary" id={titleId}>
        {mission.preset.name}
      </h3>
      <p className="orbix-prose mt-3">
        {keepCompounds(mission.preset.description)}
      </p>
    </div>
  );
  // A secondary aside, after the tables: the one-screen view of this
  // preset used for screenshots.
  const captureLink = (
    <p className="border-t border-border-subtle pt-4">
      <ButtonLink
        arrow="right"
        href={`/showcase-capture/${mission.preset.id}`}
        variant="tertiary"
      >
        Open the {mission.preset.name} presentation view
      </ButtonLink>
    </p>
  );

  return (
    <article
      aria-labelledby={titleId}
      className="border-t border-border-subtle pt-10 first:border-t-0 first:pt-0"
    >
      <MissionBody after={captureLink} header={header} mission={mission} />
    </article>
  );
}

export function MissionPresets({ missions }: MissionPresetsProps) {
  return (
    <ShowcaseSection
      id="mission-presets"
      lead="The Engineering Lab ships five educational mission presets. Each one is a typed set of inputs, shown here converted to display units such as km; the diagrams are drawn from those numbers, with the calculators’ standard Earth radius setting the scale of the transfer drawings."
      number={2}
      title="Mission presets"
    >
      <div className="grid grid-cols-1 gap-16 sm:gap-20">
        {missions.map((mission) => (
          <MissionPreset key={mission.preset.id} mission={mission} />
        ))}
      </div>
    </ShowcaseSection>
  );
}
