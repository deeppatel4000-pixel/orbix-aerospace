import type { CSSProperties } from "react";

import { formatFigure } from "@/components/ui/readout";
import type { ComparisonCellValue } from "@/features/compare/types";

interface ComparisonCellProps {
  cell: ComparisonCellValue;
  /**
   * Track length in `0..1`, or `null` when this cell renders no track, either
   * because its row is not comparable or because it has no value. Computed
   * once per row by `normalizeRowMagnitudes`, never here: a cell cannot know
   * what the rest of its row contains.
   */
  magnitude?: number | null;
  /**
   * Gives every figure its own qualifier line, even where this cell's
   * qualifiers agree. Decided once per row by `rowNeedsPerFigureQualifiers`,
   * so the figures in a row keep one vertical rhythm across its columns.
   */
  perFigure?: boolean;
}

/** Spec 13.4 wording for a vehicle value the dataset does not carry. */
export const MISSING_VALUE_TEXT = "Not published";

interface ParsedFigure {
  readonly figure: string;
  readonly label?: string;
  readonly qualifier?: string;
}

/**
 * Reads a figure out of a published value: an optional "Label: " prefix, a
 * number with an optional "+" for a published minimum and an optional unit
 * ("44.5 ft", "85,000+ ft", "1,850 mi") and an optional
 * parenthetical qualifier ("(Expendable)"). Anything else is text.
 */
function parseFigure(text: string): ParsedFigure | null {
  const match =
    /^(?:([^:]+):\s+)?(\d[\d,.]*\+?(?:\s?[A-Za-z%°/]+)?)(?:\s+(\(.+\)))?$/.exec(
      text.trim(),
    );
  if (!match?.[2]) return null;
  return { figure: match[2], label: match[1], qualifier: match[3] };
}

/**
 * Splits "5,533,000 kg" into the number and its unit, so the number can be
 * formatted on its own and then joined to the unit with a no-break space:
 * a unit never drops to the line under its figure.
 */
function splitUnit(figure: string): readonly [string, string | undefined] {
  const match = /^(\S+)\s(.+)$/.exec(figure);
  return match?.[1] && match[2] ? [match[1], match[2]] : [figure, undefined];
}

/**
 * A figure in B612 Mono with its label and qualifier in sans, so every
 * number in the sheet reads the same way.
 */
function Figure({
  parsed,
  tone,
}: {
  parsed: ParsedFigure;
  tone: "primary" | "detail";
}) {
  const [number, unit] = splitUnit(parsed.figure);
  return (
    <>
      {parsed.label ? (
        /* Below 48rem the label always takes its own line, so every cell
           in a row stacks the same way whatever the column width. */
        <span className="text-[0.8125rem] text-muted max-md:block">
          {parsed.label}:{" "}
        </span>
      ) : null}
      <span
        className={
          "orbix-readout-inline " +
          (tone === "primary"
            ? "text-sm text-foreground md:text-[1.0625rem]"
            : "text-[0.875rem] text-muted md:text-[0.9375rem]")
        }
      >
        <span className="whitespace-nowrap">
          {formatFigure(number)}
          {unit ? (
            /* Spec 5: the unit a step smaller and muted, held to its
               figure by a no-break space. */
            <span className="text-[0.8125em] text-muted">{NBSP + unit}</span>
          ) : null}
        </span>
      </span>
      {parsed.qualifier ? (
        <span className="text-[0.8125rem] text-muted"> {parsed.qualifier}</span>
      ) : null}
    </>
  );
}

/**
 * A detail line under a figure: a figure when it holds one, otherwise sans
 * text. Details under a text value are `TextLine`s instead.
 */
function DetailLine({ detail }: { detail: string }) {
  const parsed = parseFigure(detail);
  return parsed ? (
    <Figure parsed={parsed} tone="detail" />
  ) : (
    <span className="text-sm text-muted">{detail}</span>
  );
}

const pluralQualifiers: Readonly<Record<string, string>> = {
  "Published maximum": "Published maxima",
  "Published minimum": "Published minima",
};

interface SplitNote {
  /** One note for the whole cell. */
  readonly shared?: string;
  /** One qualifier per figure: the main value first, then each detail. */
  readonly perFigure?: readonly string[];
}

/**
 * Reads a combined adapter note such as "Length: Nominal value; wingspan:
 * Nominal value" (one "label: qualifier" pair per figure, in figure order).
 * When every qualifier is the same it is said once ("Nominal values");
 * otherwise each qualifier goes under its own figure. Any other note is
 * shown as the adapter wrote it.
 */
function splitNote(
  note: string,
  figureCount: number,
  forcePerFigure = false,
): SplitNote {
  const pairs = note.split("; ");
  if (pairs.length < 2 || pairs.length !== figureCount) return { shared: note };

  const qualifiers = pairs.map((pair) => {
    const separator = pair.indexOf(": ");
    return separator === -1 ? pair : pair.slice(separator + 2);
  });
  const [first] = qualifiers;
  if (
    !forcePerFigure &&
    first &&
    qualifiers.every((qualifier) => qualifier === first)
  ) {
    return {
      shared:
        pluralQualifiers[first] ??
        (first.endsWith("value") ? first + "s" : first),
    };
  }
  return { perFigure: qualifiers };
}

/**
 * Whether any cell in a row needs one qualifier per figure. When one does,
 * the whole row is given per-figure qualifiers, so its lines align across
 * the columns.
 */
export function rowNeedsPerFigureQualifiers(
  cells: readonly (ComparisonCellValue | undefined)[],
): boolean {
  return cells.some(
    (cell) =>
      cell?.status !== "unavailable" &&
      cell?.note !== undefined &&
      splitNote(cell.note, (cell.details?.length ?? 0) + 1).perFigure !==
        undefined,
  );
}

/**
 * Splits a text value such as "2 × F119-PW-100 (Low-bypass turbofan)" into
 * the designation and its bracketed description, the way `parseFigure`
 * splits a qualifier off a figure.
 */
function splitDescription(text: string): readonly [string, string | undefined] {
  const match = /^(.+?)\s+\(([^()]+)\)$/.exec(text.trim());
  return match?.[1] && match[2] ? [match[1], match[2]] : [text, undefined];
}

/** No-break space, so a count and its designation, or a figure and its
 * unit, never part. */
const NBSP = "\u00A0";

/**
 * Keeps designations such as "2 × F119-PW-100" whole: the count, the "×"
 * and the designation are joined with no-break spaces, and a word holding
 * both a digit and a hyphen is never broken at the hyphen.
 */
function KeepDesignations({ text }: { text: string }) {
  const joined = text.replace(/(\d+) × (\S)/g, "$1" + NBSP + "×" + NBSP + "$2");
  // Split on ordinary spaces only: the no-break spaces stay inside a part.
  return joined.split(/( +)/).map((part, index) =>
    /\d/.test(part) && (part.includes("-") || part.includes(NBSP)) ? (
      <span className="whitespace-nowrap" key={index}>
        {part}
      </span>
    ) : (
      part
    ),
  );
}

function Qualifier({ text }: { text: string | undefined }) {
  return text ? (
    <span className="mt-0.5 block font-sans text-xs leading-4 text-muted">
      {text}
    </span>
  ) : null;
}

/**
 * One line of a text cell: the designation in ink, and any bracketed
 * description on its own line under it in muted ink. Both are regular
 * weight, so the row labels and the figures carry the emphasis. Every
 * line of a text cell (the value and each detail) goes through this, so
 * the first line never differs from the others.
 */
function TextLine({
  qualifier,
  text,
}: {
  qualifier?: string | undefined;
  text: string;
}) {
  const [designation, description] = splitDescription(text);
  return (
    <>
      {/* 13px below 48rem, so the widest designation ("2 × F119-PW-100")
          fits the 8rem phone column whole; 15px from 48rem, so a text
          row holds its own beside the 17px mono figures. */}
      <span className="block text-[0.8125rem] leading-5 font-normal text-foreground md:text-[0.9375rem]">
        <KeepDesignations text={designation} />
      </span>
      {description ? (
        <span className="block text-[0.8125rem] leading-5 font-normal text-muted md:text-sm">
          {description}
        </span>
      ) : null}
      <Qualifier text={qualifier} />
    </>
  );
}

/** Separator the adapters use to join a list into one value. */
const LIST_SEPARATOR = " · ";

/**
 * A text cell: a list value ("Low Earth orbit · Sun-synchronous orbit")
 * as one item per line with no separator glyphs, otherwise the value and
 * its details as `TextLine`s, 6px apart.
 */
function TextValue({
  details,
  qualifierAt,
  text,
}: {
  details: readonly string[];
  qualifierAt: (index: number) => string | undefined;
  text: string;
}) {
  if (text.includes(LIST_SEPARATOR) && details.length === 0) {
    return (
      <>
        <ul className="space-y-0.5">
          {text.split(LIST_SEPARATOR).map((item) => (
            <li
              className="text-[0.8125rem] leading-5 font-normal text-foreground md:text-sm"
              key={item}
            >
              {item}
            </li>
          ))}
        </ul>
        <Qualifier text={qualifierAt(0)} />
      </>
    );
  }
  // A single value is one line of text, not a one-item list: a list would
  // be announced as "list, 1 item" in every such cell.
  if (details.length === 0) {
    return (
      <div>
        <TextLine qualifier={qualifierAt(0)} text={text} />
      </div>
    );
  }
  return (
    <ul className="space-y-1.5">
      {[text, ...details].map((line, index) => (
        <li key={line}>
          <TextLine qualifier={qualifierAt(index)} text={line} />
        </li>
      ))}
    </ul>
  );
}

/**
 * The content of one vehicle cell in the spec sheet. `DataTable` renders
 * the `<td>` around it.
 */
export function ComparisonCell({
  cell,
  magnitude,
  perFigure = false,
}: ComparisonCellProps) {
  if (cell.status === "unavailable") {
    // Real text, never a dash or an empty cell, so a screen reader announces
    // a value instead of "blank". The adapter's note says why it is missing.
    return (
      <>
        <p className="text-sm text-muted">{MISSING_VALUE_TEXT}</p>
        {cell.note ? (
          <p className="mt-1 text-xs leading-[1.125rem] text-muted">
            {cell.note}.
          </p>
        ) : null}
      </>
    );
  }

  const parsed = parseFigure(cell.value);
  const details = cell.details ?? [];
  const note = cell.note
    ? splitNote(cell.note, details.length + 1, perFigure)
    : ({} satisfies SplitNote);
  const qualifierAt = (index: number) => note.perFigure?.[index];

  return (
    <>
      {parsed ? (
        <p className="leading-6">
          <Figure parsed={parsed} tone="primary" />
          <Qualifier text={qualifierAt(0)} />
        </p>
      ) : cell.magnitude ? (
        <p className="orbix-readout-inline text-sm leading-6 text-foreground md:text-[1.0625rem]">
          {formatFigure(cell.value)}
          <Qualifier text={qualifierAt(0)} />
        </p>
      ) : (
        <TextValue
          details={details}
          qualifierAt={qualifierAt}
          text={cell.value}
        />
      )}
      {/* A 2px accent scale line under the figure, drawn on the ground with
       * no track: relative scale within the row only, no ranking. The row
       * maximum spans the full column, so every line in the row is read
       * against the same width. Hidden from assistive technology because
       * the published number above it is the value; a normalized fraction
       * is an artefact of this layout, not a property of the vehicle. The
       * height and the transparent ground override the shared rule. */}
      {typeof magnitude === "number" ? (
        <span
          aria-hidden="true"
          className="orbix-magnitude h-0.5 w-full max-w-full bg-transparent"
        >
          <span
            className="orbix-magnitude__fill"
            style={{ "--orbix-magnitude": magnitude } as CSSProperties}
          />
        </span>
      ) : null}
      {/* A text cell already rendered its details as TextLines. */}
      {details.length > 0 && (parsed || cell.magnitude) ? (
        <ul className="mt-2 space-y-1.5">
          {details.map((detail, index) => (
            <li className="leading-5" key={detail}>
              <DetailLine detail={detail} />
              <Qualifier text={qualifierAt(index + 1)} />
            </li>
          ))}
        </ul>
      ) : null}
      {note.shared ? (
        <p className="mt-2 text-xs leading-[1.125rem] text-muted">
          {note.shared}
        </p>
      ) : null}
    </>
  );
}
