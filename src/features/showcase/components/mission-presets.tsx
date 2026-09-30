import type { ReactNode } from "react";

import { ButtonLink } from "@/components/ui/button-link";
import { DataTable } from "@/components/ui/data-table";
import { SpecPanel } from "@/components/ui/spec-panel";
import { cn } from "@/lib/cn";
import { formatShowcaseNumber } from "@/features/showcase/components/format";
import { keepCompounds } from "@/features/showcase/components/keep-compounds";
import {
  AllowanceBars,
  AllowanceSum,
  isPointScaleTransfer,
  TransferOrbitDiagram,
  type TransferDiagramSize,
} from "@/features/showcase/components/mission-diagrams";
import { ShowcaseSection } from "@/features/showcase/components/showcase-section";
import type {
  PresetInputGroup,
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
 * Below 48rem the showcase tables use 10px cell padding in place of 16px,
 * so the two-vehicle table fits a 390px screen without scrolling.
 */
const phoneCells = "max-md:[&_:is(th,td)]:px-2.5";

/**
 * Paired tables in the capture view, the vehicle table included: 10px
 * cells from 1024px, so the preset fits one 1440x900 screen.
 */
const pairedCells = "lg:gap-x-6 lg:[&_:is(th,td)]:p-2.5";

/** One input group as a two-column table, Input and Value, captioned with
 * the group title. The unit is set after the figure in the value cell, so
 * a quantity never shows without its unit and the table fits a 320px
 * screen. */
function InputGroupTable({
  group,
  mission,
}: {
  group: PresetInputGroup;
  mission: ShowcaseMission;
}) {
  return (
    <DataTable<PresetInputRow>
      caption={tableCaption(group.title, mission)}
      className={phoneCells}
      columns={[
        { cell: (row) => row.label, header: "Input", key: "input" },
        {
          cell: (row) => (
            <>
              {formatShowcaseNumber(row.value)}
              {row.unit ? (
                <span className="orbix-table-unit ml-1.5">{row.unit}</span>
              ) : null}
            </>
          ),
          header: "Value",
          key: "value",
          numeric: true,
        },
      ]}
      getRowKey={(row) => row.label}
      rows={group.rows}
    />
  );
}

/**
 * The capture view's tables: one `InputGroupTable` per group, and `extra`
 * (the vehicle table). `pair` sets two groups side by side from 48rem.
 * With two groups and `extra`, the two groups stack in a first column as
 * wide as the wider table needs with its labels on one line, and the
 * vehicle table runs beside both at its natural height, top-aligned, so
 * the capture view of a preset with a vehicle fits one laptop screen.
 */
function PresetInputsTable({
  extra,
  mission,
  pair = false,
}: {
  extra?: ReactNode;
  mission: ShowcaseMission;
  pair?: boolean;
}) {
  const groups = mission.inputGroups.length;

  if (groups === 0) {
    return extra ?? null;
  }

  const paired = pair && groups > 1;

  return (
    <div
      className={cn(
        "grid min-w-0 grid-cols-1 content-start",
        paired ? "gap-5 md:gap-x-8" : "gap-8",
        paired && pairedCells,
        paired &&
          (extra != null && groups === 2
            ? "md:grid-cols-[max-content_minmax(0,1fr)] md:items-start md:[&_tbody_th]:whitespace-nowrap md:[&>:last-child]:col-start-2 md:[&>:last-child]:row-span-2 md:[&>:last-child]:row-start-1"
            : "md:grid-cols-2"),
      )}
    >
      {mission.inputGroups.map((group) => (
        <InputGroupTable group={group} key={group.title} mission={mission} />
      ))}
      {extra != null ? <div className="min-w-0">{extra}</div> : null}
    </div>
  );
}

/** One quantity of the vehicle table: a row, read across the vehicles. */
interface VehicleQuantity {
  readonly label: string;
  readonly unit?: string;
  readonly value: (vehicle: VehicleReentryConfiguration) => number;
}

const VEHICLE_QUANTITIES: readonly VehicleQuantity[] = [
  { label: "Mass", unit: "kg", value: (vehicle) => vehicle.massKilograms },
  {
    label: "Drag coefficient",
    value: (vehicle) => vehicle.dragCoefficient,
  },
  {
    label: "Reference area",
    unit: "m²",
    value: (vehicle) => vehicle.referenceAreaSquareMetres,
  },
  {
    label: "Nose radius",
    unit: "m",
    value: (vehicle) => vehicle.noseRadiusMetres,
  },
];

/** A quantity and its unit, set after the figure in one value cell. */
function quantityCell(
  row: VehicleQuantity,
  vehicle: VehicleReentryConfiguration,
) {
  return (
    <>
      {formatShowcaseNumber(row.value(vehicle))}
      {row.unit ? (
        <span className="orbix-table-unit ml-1.5">{row.unit}</span>
      ) : null}
    </>
  );
}

/**
 * One vehicle's quantities in two columns, Quantity and Value, captioned
 * with the vehicle name. The quantity labels stay on one line.
 */
function SingleVehicleTable({
  mission,
  vehicle,
}: {
  mission: ShowcaseMission;
  vehicle: VehicleReentryConfiguration;
}) {
  return (
    <DataTable<VehicleQuantity>
      caption={tableCaption(`Vehicle inputs, ${vehicle.vehicleName}`, mission)}
      className={cn(phoneCells, "[&_tbody_th]:whitespace-nowrap")}
      columns={[
        { cell: (row) => row.label, header: "Quantity", key: "quantity" },
        {
          cell: (row) => quantityCell(row, vehicle),
          header: "Value",
          key: "value",
          numeric: true,
        },
      ]}
      getRowKey={(row) => row.label}
      rows={VEHICLE_QUANTITIES}
    />
  );
}

/**
 * The vehicle inputs. One vehicle: a Quantity and Value table. Several:
 * from 48rem one table with the vehicles as columns, so they compare side
 * by side; below 48rem one Quantity and Value table per vehicle, so no
 * quantity is cut off from its unit on a phone screen.
 */
function VehicleInputsTable({ mission }: { mission: ShowcaseMission }) {
  const { vehicles } = mission;
  const [first, ...others] = vehicles;

  if (!first) {
    return null;
  }

  if (others.length === 0) {
    return <SingleVehicleTable mission={mission} vehicle={first} />;
  }

  return (
    <>
      <div className="max-md:hidden">
        <DataTable<VehicleQuantity>
          caption={tableCaption("Vehicle inputs", mission)}
          className="[&_tbody_th]:whitespace-nowrap [&_thead_th]:align-bottom [&_thead_th]:whitespace-normal"
          columns={[
            { cell: (row) => row.label, header: "Quantity", key: "quantity" },
            ...vehicles.map((vehicle) => ({
              cell: (row: VehicleQuantity) => quantityCell(row, vehicle),
              header: vehicle.vehicleName,
              key: vehicle.vehicleName,
              numeric: true,
            })),
          ]}
          getRowKey={(row) => row.label}
          rows={VEHICLE_QUANTITIES}
        />
      </div>
      <div className="grid gap-8 md:hidden">
        {vehicles.map((vehicle) => (
          <SingleVehicleTable
            key={vehicle.vehicleName}
            mission={mission}
            vehicle={vehicle}
          />
        ))}
      </div>
    </>
  );
}

function MissionDiagramView({
  fill = false,
  mission,
  showSum = true,
  size,
}: {
  /** Let a plate that can grow fill the height of its column. */
  fill?: boolean;
  mission: ShowcaseMission;
  /** Close the allowance plate with the sum (the page). */
  showSum?: boolean;
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
    return (
      <AllowanceBars
        diagram={diagram}
        fill={fill}
        missionId={mission.preset.id}
        showSum={showSum}
      />
    );
  }

  return null;
}

/**
 * The input groups of a preset without a drawing (reentry only) as spec
 * panels, one large readout per input, in the place a drawing takes on
 * the other presets. `stacked` (the capture's first column) sets the
 * readouts one above the other from 1024px and stretches the panel to the
 * column's height.
 */
function EntryPanels({
  mission,
  stacked = false,
}: {
  mission: ShowcaseMission;
  stacked?: boolean;
}) {
  return (
    <>
      {mission.inputGroups.map((group) => (
        <SpecPanel
          aria-label={`${group.title}, ${mission.preset.name}`}
          className={cn(
            "[&_.orbix-spec-cell]:justify-between max-sm:[&_.orbix-spec-grid]:grid-cols-1",
            stacked &&
              "lg:flex lg:h-full lg:flex-col lg:[&_.orbix-spec-grid]:flex-1 lg:[&_.orbix-spec-grid]:auto-rows-fr lg:[&_.orbix-spec-grid]:grid-cols-1",
          )}
          columns={3}
          items={group.rows.map((row) => ({
            label: row.label,
            unit: row.unit,
            value: formatShowcaseNumber(row.value),
          }))}
          key={group.title}
          kicker={group.title}
        />
      ))}
    </>
  );
}

/** One maneuver allowance of the capture's allowance table. */
type Allowance = Extract<
  ShowcaseMission["diagram"],
  { kind: "allowances" }
>["maneuvers"][number];

/**
 * The capture's text column for the allowance preset: the sum as a large
 * readout, then the allowances as a Maneuver and Allowance table, so the
 * plate beside it carries the bars only.
 */
function AllowanceFacts({ mission }: { mission: ShowcaseMission }) {
  const { diagram } = mission;

  if (diagram.kind !== "allowances") {
    return null;
  }

  return (
    <div className="grid min-w-0 gap-8">
      <AllowanceSum diagram={diagram} />
      <DataTable<Allowance>
        caption={tableCaption("Delta-v allowances", mission)}
        className={phoneCells}
        columns={[
          { cell: (row) => row.name, header: "Maneuver", key: "maneuver" },
          {
            cell: (row) => (
              <>
                {formatShowcaseNumber(row.deltaVMetresPerSecond)}
                <span className="orbix-table-unit ml-1.5">m/s</span>
              </>
            ),
            header: "Allowance",
            key: "allowance",
            numeric: true,
          },
        ]}
        getRowKey={(row) => row.id}
        rows={diagram.maneuvers}
      />
    </div>
  );
}

interface MissionBodyProps {
  /** Content set last, after the tables (the page). */
  readonly after?: ReactNode;
  readonly className?: string;
  /** Content set last, across both columns (the capture view). */
  readonly footer?: ReactNode;
  /** The preset's title block. */
  readonly header: ReactNode;
  readonly mission: ShowcaseMission;
  /**
   * `page`: one column on the reading track. `capture`: two columns from
   * 1024px and `footer` across both, so the preset fits one laptop screen.
   */
  readonly variant?: "capture" | "page";
}

/**
 * One preset on the page (spec 9, editorial single column): the title
 * block on the 68ch measure, then the figure at the track's full width,
 * then the input tables, two to a row from 48rem, and `after`. A preset
 * without orbital geometry (reentry only) shows its entry conditions as a
 * spec panel in the figure's place.
 */
function PageMissionBody({
  after,
  className,
  header,
  mission,
}: Omit<MissionBodyProps, "footer" | "variant">) {
  const drawn = mission.diagram.kind !== "none";
  const groups = drawn ? mission.inputGroups : [];
  const hasVehicles = mission.vehicles.length > 0;
  const tableCount = groups.length + (hasVehicles ? 1 : 0);

  return (
    <div className={cn("grid grid-cols-1 gap-8 sm:gap-10", className)}>
      <div className="min-w-0">{header}</div>
      <div className="min-w-0">
        {drawn ? (
          <MissionDiagramView
            mission={mission}
            size={
              isPointScaleTransfer(mission.diagram) ? "feature" : "standard"
            }
          />
        ) : (
          <EntryPanels mission={mission} />
        )}
      </div>
      {tableCount > 0 ? (
        <div
          className={cn(
            "grid min-w-0 grid-cols-1 gap-8 md:items-start md:gap-x-8",
            tableCount > 1 &&
              "md:grid-cols-2 md:[&>:last-child:nth-child(odd)]:col-span-2",
          )}
        >
          {groups.map((group) => (
            <InputGroupTable
              group={group}
              key={group.title}
              mission={mission}
            />
          ))}
          {hasVehicles ? (
            <div className="min-w-0">
              <VehicleInputsTable mission={mission} />
            </div>
          ) : null}
        </div>
      ) : null}
      {after ? <div className="min-w-0">{after}</div> : null}
    </div>
  );
}

/**
 * One preset on one screen (the capture view). From 1024px the figure (or
 * the entry conditions, or the allowance bars) holds the first column and
 * the title block opens the second, level with the top of the figure; the
 * tables follow the title. Below 1024px the title comes first, then the
 * figure, then the tables. `footer` closes it on the screen's bottom line.
 * The DOM sets the title first, then the figure, then the tables, the
 * same order as the phone layout.
 */
function CaptureMissionBody({
  className,
  footer,
  header,
  mission,
}: Omit<MissionBodyProps, "after" | "variant">) {
  const { diagram } = mission;
  const hasInputs = mission.inputGroups.length > 0;
  const vehicles =
    mission.vehicles.length > 0 ? (
      <VehicleInputsTable mission={mission} />
    ) : null;
  const text = "min-w-0 lg:col-start-2";
  const figure = cn(
    "min-w-0 lg:col-start-1 lg:row-span-2 lg:row-start-1",
    // A plate that can grow ends on the columns' bottom line.
    diagram.kind !== "transfer" && "lg:flex lg:flex-col",
  );

  let figureContent: ReactNode;
  let tables: ReactNode;

  if (diagram.kind === "none") {
    figureContent = <EntryPanels mission={mission} stacked />;
    tables = vehicles;
  } else if (diagram.kind === "allowances") {
    figureContent = (
      <MissionDiagramView fill mission={mission} showSum={false} />
    );
    tables = <AllowanceFacts mission={mission} />;
  } else {
    figureContent = <MissionDiagramView mission={mission} size="compact" />;
    tables =
      hasInputs || vehicles ? (
        <PresetInputsTable extra={vehicles} mission={mission} pair />
      ) : null;
  }

  return (
    <div className={cn("flex flex-col gap-5", className)}>
      <div className="grid flex-1 grid-cols-1 gap-5 lg:grid-cols-[21rem_minmax(0,1fr)] lg:grid-rows-[auto_1fr] lg:gap-x-10 xl:grid-cols-[27rem_minmax(0,1fr)] xl:gap-x-12">
        <div className={cn(text, "lg:row-start-1")}>{header}</div>
        <div className={figure}>{figureContent}</div>
        {tables ? (
          <div className={cn(text, "lg:row-start-2 lg:self-start")}>
            {tables}
          </div>
        ) : null}
      </div>
      {footer}
    </div>
  );
}

export function MissionBody({
  after,
  className,
  footer,
  header,
  mission,
  variant = "page",
}: MissionBodyProps) {
  return variant === "capture" ? (
    <CaptureMissionBody
      className={className}
      footer={footer}
      header={header}
      mission={mission}
    />
  ) : (
    <PageMissionBody
      after={after}
      className={className}
      header={header}
      mission={mission}
    />
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
