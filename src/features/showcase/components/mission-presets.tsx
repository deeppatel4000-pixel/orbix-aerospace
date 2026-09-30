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
 * Below 48rem the showcase tables use 10px cell padding in place of 16px,
 * so the two-vehicle table fits a 390px screen without scrolling.
 */
const phoneCells = "max-md:[&_:is(th,td)]:px-2.5";

/**
 * Paired tables in the capture view, the vehicle table included: 10px
 * cells from 1024px, so the preset fits one 1440x900 screen.
 */
const pairedCells = "lg:gap-x-6 lg:[&_:is(th,td)]:p-2.5";

/**
 * One `DataTable` per input group, each captioned with the group title.
 * Two columns, Input and Value, with the unit set after the figure in the
 * value cell, so a quantity never shows without its unit and every table
 * fits a 320px screen. `pair` sets two groups side by side from 48rem.
 * With two groups and `extra` (the vehicle table), the two groups stack
 * in a first column as wide as the wider table needs with its labels on
 * one line, and the vehicle table runs beside both at its natural height,
 * top-aligned, so the capture view of a preset with a vehicle fits one
 * laptop screen.
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
          key={group.title}
          rows={group.rows}
        />
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
  size,
}: {
  /** Let a plate that can grow fill the height of its column. */
  fill?: boolean;
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
    return (
      <AllowanceBars
        diagram={diagram}
        fill={fill}
        missionId={mission.preset.id}
      />
    );
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
   * `page`: a 7 to 5 split from 1024px. `capture`: a narrower figure
   * column and `footer` across both, so the preset fits one laptop screen.
   */
  readonly variant?: "capture" | "page";
}

/**
 * One template for every preset. From 1024px the figure holds the first
 * column and the title block opens the second, level with the top of the
 * plate; the input tables, the vehicle table and `after` follow the title
 * in that order. Below 1024px the title comes first, then the figure, then
 * the tables and `after`. `footer` closes it.
 *
 * A preset without orbital geometry (reentry only) has no drawing. On the
 * page its tables take the figure's column from 1024px, so every title
 * sits on the same vertical line. In the capture view the title and the
 * vehicle table hold the second column and the entry conditions the
 * first; there, as with the drawn presets, the DOM sets the title before
 * the first column, so focus reaches the left table last.
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
  const drawn = diagram.kind !== "none";
  const size: TransferDiagramSize = capture
    ? "compact"
    : isPointScaleTransfer(diagram)
      ? "feature"
      : "standard";
  const hasInputs = mission.inputGroups.length > 0;
  const vehicles =
    mission.vehicles.length > 0 ? (
      <VehicleInputsTable mission={mission} />
    ) : null;
  const gap = capture ? "gap-5" : "gap-10";
  // The capture body is a column that fills the screen, so a footer with
  // `mt-auto` sits on the same bottom line in every capture.
  const root = capture ? "flex flex-col" : "grid grid-cols-1";
  // In the capture view the columns take the height the footer leaves, so
  // a plate that can grow (the allowances) ends on the columns' bottom line.
  const columns = cn(
    "grid grid-cols-1",
    capture && "flex-1",
    gap,
    capture
      ? "lg:grid-cols-[21rem_minmax(0,1fr)] lg:gap-x-10 xl:grid-cols-[27rem_minmax(0,1fr)] xl:gap-x-12"
      : "lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-x-12 xl:gap-x-16",
  );

  if (!drawn && capture) {
    // In the capture view the title and the vehicle table share the second
    // column, as the title and tables do on every other capture, and the
    // entry conditions take the first column in place of the drawing. Each
    // table then has the width its labels need on one line.
    return (
      <div className={cn(root, gap, className)}>
        <div className={columns}>
          <div
            className={cn(
              "grid min-w-0 content-start lg:col-start-2 lg:row-start-1",
              gap,
            )}
          >
            <div className="min-w-0">{header}</div>
            {vehicles}
          </div>
          {hasInputs ? (
            <div className="min-w-0 lg:col-start-1 lg:row-start-1 lg:self-start">
              <PresetInputsTable mission={mission} />
            </div>
          ) : null}
        </div>
        {footer}
      </div>
    );
  }

  if (!drawn) {
    // The second row takes the spare height, so `after` sits right under
    // the title while the tables beside them run on.
    return (
      <div className={cn("grid grid-cols-1", gap, className)}>
        <div className={cn(columns, "lg:grid-rows-[auto_1fr]")}>
          <div className="min-w-0 lg:col-start-2 lg:row-start-1">{header}</div>
          <div
            className={cn(
              "grid min-w-0 content-start lg:col-start-1 lg:row-span-2 lg:row-start-1",
              gap,
            )}
          >
            {hasInputs ? <PresetInputsTable mission={mission} /> : null}
            {vehicles}
          </div>
          {after ? (
            <div className="min-w-0 lg:col-start-2 lg:row-start-2 lg:self-start">
              {after}
            </div>
          ) : null}
        </div>
        {footer}
      </div>
    );
  }

  // The column that is often the shorter one stays in view beside the
  // other while it scrolls: the text column, or the plate when a vehicle
  // table makes the text column the longer one.
  const stickFigure = !capture && mission.vehicles.length > 0;
  const fillFigure = capture && diagram.kind === "allowances";
  const sticky = "lg:sticky lg:top-24 lg:self-start";
  const column = cn("grid min-w-0 content-start max-lg:contents", gap);

  return (
    <div className={cn(root, gap, className)}>
      <div className={columns}>
        <div
          className={cn(
            column,
            "lg:col-start-2 lg:row-start-1",
            !capture && !stickFigure && sticky,
          )}
        >
          <div className="min-w-0 max-lg:order-1">{header}</div>
          {/* In the capture view the vehicle table joins the paired input
              tables, so the preset fits one laptop screen. */}
          {hasInputs || (capture && vehicles) ? (
            <div className="min-w-0 max-lg:order-3">
              <PresetInputsTable
                extra={capture ? vehicles : undefined}
                mission={mission}
                pair={capture && vehicles != null}
              />
            </div>
          ) : null}
          {vehicles && !capture ? (
            <div className="min-w-0 max-lg:order-3">{vehicles}</div>
          ) : null}
          {after ? <div className="min-w-0 max-lg:order-3">{after}</div> : null}
        </div>
        <div
          className={cn(
            column,
            "lg:col-start-1 lg:row-start-1",
            stickFigure && sticky,
            fillFigure && "lg:flex lg:flex-col",
          )}
        >
          <div
            className={cn(
              "min-w-0 max-lg:order-2",
              fillFigure && "lg:flex lg:flex-1 lg:flex-col",
            )}
          >
            <MissionDiagramView
              fill={fillFigure}
              mission={mission}
              size={size}
            />
          </div>
        </div>
      </div>
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
