import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

import type { Measurement, MeasurementUnit } from "@/features/vehicles/types";
import {
  formatMeasurementParts,
  formatQualifierLabel,
} from "@/features/vehicles/utils/format-measurement";

/**
 * Display helpers for vehicle figures: the published value with its unit,
 * and the same figure converted to the other unit system (spec 8: dual units
 * where the data has them). The records publish one unit per figure; the
 * second unit is calculated here with exact conversion factors and rounded
 * to four significant figures, and pages say so next to the figures.
 */

interface Conversion {
  readonly factor: number;
  readonly unit: string;
}

/** Imperial to SI and SI to imperial. Mach has no fixed conversion. */
const conversions: Partial<Record<MeasurementUnit, Conversion>> = {
  ft: { factor: 0.3048, unit: "m" },
  kg: { factor: 1 / 0.45359237, unit: "lb" },
  km: { factor: 1 / 1.609344, unit: "mi" },
  "km/h": { factor: 1 / 1.609344, unit: "mph" },
  kN: { factor: 1000 / 4.4482216152605, unit: "lbf" },
  kn: { factor: 1.852, unit: "km/h" },
  lb: { factor: 0.45359237, unit: "kg" },
  lbf: { factor: 4.4482216152605 / 1000, unit: "kN" },
  m: { factor: 1 / 0.3048, unit: "ft" },
  "m/s": { factor: 3.6, unit: "km/h" },
  mi: { factor: 1.609344, unit: "km" },
  MN: { factor: 1e6 / 4.4482216152605, unit: "lbf" },
  mph: { factor: 1.609344, unit: "km/h" },
  N: { factor: 1 / 4.4482216152605, unit: "lbf" },
  nmi: { factor: 1.852, unit: "km" },
  t: { factor: 1000 / 0.45359237, unit: "lb" },
};

/** Four significant figures, at most one decimal place: 15,240 or 25.9. */
function formatConverted(value: number) {
  if (value === 0) return "0";
  const magnitude = Math.floor(Math.log10(Math.abs(value)));
  const step = 10 ** Math.max(magnitude - 3, -1);
  const rounded = Math.round(value / step) * step;

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: step < 1 ? 1 : 0,
  }).format(rounded);
}

interface MeasurementText {
  readonly unit: string;
  readonly value: string;
}

/**
 * The measurement converted to the other unit system, or undefined when no
 * fixed conversion exists (Mach depends on the air temperature).
 */
function convertMeasurement(
  measurement: Measurement<MeasurementUnit>,
): MeasurementText | undefined {
  const conversion = conversions[measurement.unit];
  if (!conversion) return undefined;

  return {
    unit: conversion.unit,
    value: formatConverted(measurement.value * conversion.factor),
  };
}

/** "15,240 m", as plain text, or undefined when there is no conversion. */
function convertedText(measurement: Measurement<MeasurementUnit>) {
  const converted = convertMeasurement(measurement);
  return converted ? `${converted.value} ${converted.unit}` : undefined;
}

/**
 * A figure for a numeric table cell: the number, then the unit in muted
 * text. Plain elements only, so the table's figure formatting reaches the
 * digits. Mach is written before the number, as it is spoken.
 */
function renderMeasurement(measurement: Measurement<MeasurementUnit>) {
  const { unit, value } = formatMeasurementParts(measurement);
  // The plus sign of `measurementParts`, so a published minimum reads the
  // same in the hero, on the cards and in the tables.
  const figure = `${value}${measurement.qualifier === "minimum" ? "+" : ""}`;

  return measurement.unit === "Mach" ? (
    <span>
      <span className="orbix-table-unit">Mach</span> {figure}
    </span>
  ) : (
    <span>
      {figure} <span className="orbix-table-unit">{unit}</span>
    </span>
  );
}

/**
 * Spec panel, record row and card parts: value and unit kept apart. A value
 * the source publishes as a minimum gets a plus sign ("Mach 3+", "50,000+
 * ft") so a floor never reads as an exact or maximum figure. Pages that
 * show these parts say what the sign means (`minimumNote`).
 */
export function measurementParts(measurement: Measurement<MeasurementUnit>) {
  const { unit, value } = formatMeasurementParts(measurement);
  const floor = measurement.qualifier === "minimum" ? "+" : "";
  return measurement.unit === "Mach"
    ? { unit: undefined, value: `Mach ${value}${floor}` }
    : { unit, value: `${value}${floor}` };
}

/**
 * `measurementParts` for display: the same value and unit, but "Mach" is
 * set as a unit before the figure, a step smaller and muted like every
 * other unit (spec 5), instead of in the figure's size and ink. The text
 * still reads "Mach 3+". `unitClassName` sizes the prefix to match the
 * units around it.
 */
export function measurementFigure(
  measurement: Measurement<MeasurementUnit>,
  unitClassName = "text-[0.75em]",
): { unit: string | undefined; value: ReactNode } {
  const parts = measurementParts(measurement);
  if (measurement.unit !== "Mach") return parts;
  const figure = parts.value.replace(/^Mach\s+/, "");
  return {
    unit: undefined,
    value: (
      <>
        <span
          className={cn("mr-[0.3em] tracking-normal text-muted", unitClassName)}
        >
          Mach
        </span>
        {figure}
      </>
    ),
  };
}

/** The source's qualifier as a sentence-case label, or undefined if exact. */
function qualifierNote(measurement: Measurement<MeasurementUnit>) {
  const { qualifier } = measurement;
  return qualifier && qualifier !== "exact"
    ? formatQualifierLabel(qualifier)
    : undefined;
}

/**
 * The secondary lines of a spec panel cell: the converted figure on one
 * line (never broken), then the source's qualifier on its own line in the
 * sans face, so "15,240 m" and "Published minimum" never read as one.
 * `extraNote` adds a further qualifier to that line, such as the launch
 * configuration a payload figure was published for ("Expendable").
 */
export function panelSecondary(
  measurement: Measurement<MeasurementUnit>,
  extraNote?: string,
) {
  const converted = convertedText(measurement);
  const note = joinNotes(qualifierNote(measurement), extraNote);
  if (!converted && !note) return undefined;

  return (
    <span className="block">
      {converted ? (
        <span className="block whitespace-nowrap text-text-secondary">
          {converted}
        </span>
      ) : null}
      {note ? <QualifierLine>{note}</QualifierLine> : null}
    </span>
  );
}

/** "Approximate, expendable": qualifiers joined in sentence case. */
function joinNotes(...notes: (string | undefined)[]) {
  const present = notes.filter((note): note is string => Boolean(note));
  if (present.length === 0) return undefined;
  return present
    .map((note, index) =>
      index === 0 ? note : note.toLocaleLowerCase("en-US"),
    )
    .join(", ");
}

/** The qualifier line under a figure, in the sans face. */
function QualifierLine({ children }: { children: string }) {
  return (
    <span className="mt-0.5 block font-sans text-xs font-normal tracking-normal whitespace-normal text-muted">
      {children}
    </span>
  );
}

/**
 * Said once per page, under the first table: where the second unit comes
 * from.
 */
export const CONVERSION_NOTE =
  "Published figures are shown as recorded. The figure under each one, in the other unit system, is converted by ORBIX and rounded to four significant figures.";

/** The meaning of the plus sign added by `measurementParts`. */
export const MINIMUM_NOTE =
  "A plus sign after a figure marks a published minimum.";

/**
 * `MINIMUM_NOTE` for a table that shows at least one published minimum,
 * otherwise undefined, so the note only sits under a table with a plus.
 */
export function minimumNote(
  measurements: readonly (Measurement<MeasurementUnit> | undefined)[],
) {
  return measurements.some(
    (measurement) => measurement?.qualifier === "minimum",
  )
    ? MINIMUM_NOTE
    : undefined;
}

/**
 * The notes for a table's figures: `MINIMUM_NOTE` when one is a published
 * minimum, and, when one is published as nominal, what an unmarked figure
 * is (spec sheets drop the "Nominal" line under each figure, so the
 * definition is said once here instead).
 */
export function basisNote(
  measurements: readonly (Measurement<MeasurementUnit> | undefined)[],
) {
  const qualifiers = new Set(
    measurements.map((measurement) => measurement?.qualifier ?? "exact"),
  );
  // One wording for every table, true whether the sheet mixes exact and
  // nominal figures or has only nominal ones.
  const unmarked = qualifiers.has("nominal")
    ? "A figure with no qualifier is a published or nominal value."
    : undefined;
  return joinTableNotes(unmarked, minimumNote(measurements));
}

/** Notes for under a table, joined as sentences, or undefined if none. */
export function joinTableNotes(...notes: (string | undefined)[]) {
  const present = notes.filter((note): note is string => Boolean(note));
  return present.length > 0 ? present.join(" ") : undefined;
}

/**
 * The one dual-unit pattern used in every vehicle table (spec 8): the
 * published figure, then the ORBIX conversion on a second muted line, then
 * the source's qualifier ("Approximate", "Published minimum") on a third
 * line in the sans face, except "Nominal", which the table note defines
 * (`basisNote`). On a phone the qualifier is always read under its own
 * figure, since a separate Basis column there sat off-screen or was
 * clipped mid-word; the Specifications and Performance sheets move it to
 * a Basis column from 48rem (`MeasurementTable`).
 */
export function renderDualMeasurement(
  measurement: Measurement<MeasurementUnit>,
  {
    qualifierClassName,
  }: {
    /**
     * Classes for the qualifier line, such as `md:hidden` in a table that
     * gives the qualifier its own Basis column from 48rem
     * (`measurementBasis`).
     */
    qualifierClassName?: string;
  } = {},
) {
  const converted = convertMeasurement(measurement);
  const note = measurementBasis(measurement);
  const floor = measurement.qualifier === "minimum" ? "+" : "";

  return (
    <span className="block">
      <span className="block whitespace-nowrap">
        {renderMeasurement(measurement)}
      </span>
      {converted ? (
        <span className="mt-1 block text-xs whitespace-nowrap text-muted">
          {converted.value}
          {floor} {converted.unit}
        </span>
      ) : null}
      {note ? (
        <span
          className={cn(
            "mt-1 block font-sans text-xs whitespace-nowrap text-muted",
            qualifierClassName,
          )}
        >
          {note}
        </span>
      ) : null}
    </span>
  );
}

/**
 * The qualifier `renderDualMeasurement` sets under a figure ("Approximate",
 * "Published minimum"), or undefined when exact or nominal (`basisNote`
 * defines an unmarked figure), for a table's Basis column.
 */
export function measurementBasis(measurement: Measurement<MeasurementUnit>) {
  // "Nominal" under every row turned the sheet into noise; `basisNote`
  // says once, under the table, what an unmarked figure is.
  return measurement.qualifier === "nominal"
    ? undefined
    : qualifierNote(measurement);
}
