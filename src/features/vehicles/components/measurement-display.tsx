import type { ReactNode } from "react";

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

  return measurement.unit === "Mach" ? (
    <span>
      <span className="orbix-table-unit">Mach</span> {value}
    </span>
  ) : (
    <span>
      {value} <span className="orbix-table-unit">{unit}</span>
    </span>
  );
}

/**
 * Spec panel, record row and card parts: value and unit kept apart. A value
 * the source publishes as a minimum gets a plus sign ("Mach 3+", "50,000+
 * ft") so a floor never reads as an exact or maximum figure. Pages that
 * show these parts say what the sign means (`FIGURES_NOTE`).
 */
export function measurementParts(measurement: Measurement<MeasurementUnit>) {
  const { unit, value } = formatMeasurementParts(measurement);
  const floor = measurement.qualifier === "minimum" ? "+" : "";
  return measurement.unit === "Mach"
    ? { unit: undefined, value: `Mach ${value}${floor}` }
    : { unit, value: `${value}${floor}` };
}

/** `measurementParts` as one string, for card spec rows: "50,000+ ft". */
export function recordText(measurement: Measurement<MeasurementUnit>) {
  const { unit, value } = measurementParts(measurement);
  return unit ? `${value} ${unit}` : value;
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
 * A card or record-row figure with a qualifier line under it, for example
 * a payload figure and the configuration it was published for. The figure
 * and its unit stay on one line.
 */
export function qualifiedFigure(
  figure: ReactNode,
  measurement: Measurement<MeasurementUnit> | undefined,
  extraNote?: string,
) {
  const note = joinNotes(
    measurement ? qualifierNote(measurement) : undefined,
    extraNote,
  );
  return (
    <>
      <span className="whitespace-nowrap">{figure}</span>
      {note ? <QualifierLine>{note}</QualifierLine> : null}
    </>
  );
}

/**
 * Said once per page, after the first table or in the page's figures
 * note: where the second unit comes from, and what a plus sign means.
 */
export const CONVERSION_NOTE =
  "Published figures are shown as recorded. The figure under each one, in the other unit system, is converted by ORBIX and rounded to four significant figures.";

/** The meaning of the plus sign added by `measurementParts`. */
export const MINIMUM_NOTE =
  "A plus sign after a figure marks a published minimum.";

/**
 * The one dual-unit pattern used in every vehicle table (spec 8): the
 * published figure, then the ORBIX conversion on a second muted line. With
 * `qualifier`, the source's qualifier follows on a third line in the sans
 * face, for tables with several figure columns where a basis column per
 * figure would be too wide; other tables give it in a Basis column.
 */
export function renderDualMeasurement(
  measurement: Measurement<MeasurementUnit>,
  { qualifier = false }: { qualifier?: boolean } = {},
) {
  const converted = convertMeasurement(measurement);
  const note = qualifier ? qualifierNote(measurement) : undefined;

  return (
    <span className="block">
      <span className="block whitespace-nowrap">
        {renderMeasurement(measurement)}
      </span>
      {converted ? (
        <span className="mt-1 block text-xs whitespace-nowrap text-muted">
          {converted.value} {converted.unit}
        </span>
      ) : null}
      {note ? (
        <span className="mt-1 block font-sans text-xs text-muted">{note}</span>
      ) : null}
    </span>
  );
}
