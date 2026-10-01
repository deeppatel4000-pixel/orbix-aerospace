"use client";

import { CircleAlert } from "lucide-react";

/**
 * One numeric parameter, rendered with the shared field pattern (spec 9).
 *
 * The label sits above the control and stays the accessible name on its own,
 * so a field can be found by its plain name ("Thrust"). The unit is plain muted
 * text after the input (spec 9, never a bordered cell) and is also announced
 * through `aria-describedby`, together with the help text and, when present,
 * the error message. The invalid state marks the border and prints a message with an
 * icon, so colour is never the only signal.
 *
 * In the lab every unit sits in a column of one width (`.lab-field__unit`).
 * A dimensionless field has no unit at all, and its input stops where the
 * others stop. The input keeps an 8rem minimum so a value stays readable
 * beside the unit on a 320px screen.
 *
 * Parsing and validation stay in each calculator; this component does neither.
 */

interface CalculatorNumberFieldProps<Field extends string> {
  error?: string;
  field: Field;
  hint: string;
  idPrefix: string;
  label: string;
  onChange: (field: Field, value: string) => void;
  /** Marks a field the calculation can run without; defaults to required. */
  optional?: boolean;
  unit: string;
  value: string;
}

export function CalculatorNumberField<Field extends string>({
  error,
  field,
  hint,
  idPrefix,
  label,
  onChange,
  optional = false,
  unit,
  value,
}: CalculatorNumberFieldProps<Field>) {
  const inputId = idPrefix + "-" + field;
  const unitId = inputId + "-unit";
  const hintId = inputId + "-hint";
  const errorId = inputId + "-error";
  const describedBy = [unit ? unitId : null, hintId, error ? errorId : null]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="orbix-field">
      <label className="orbix-field__label" htmlFor={inputId}>
        {label}
      </label>
      <div className="orbix-field__control">
        <input
          aria-describedby={describedBy}
          aria-errormessage={error ? errorId : undefined}
          aria-invalid={error ? true : undefined}
          className="orbix-input min-w-32"
          id={inputId}
          inputMode="decimal"
          onChange={(event) => onChange(field, event.target.value)}
          required={!optional}
          step="any"
          type="number"
          value={value}
        />
        {unit ? (
          <span
            className="orbix-field__unit lab-field__unit"
            aria-hidden="true"
          >
            {unit}
          </span>
        ) : null}
      </div>
      {unit ? (
        <span className="sr-only" id={unitId}>
          Unit: {unit}
        </span>
      ) : null}
      <p className="orbix-field__help" id={hintId}>
        {hint}
      </p>
      {error ? (
        <p className="orbix-field__error" id={errorId}>
          <CircleAlert aria-hidden="true" className="shrink-0" size={14} />
          {error}
        </p>
      ) : null}
    </div>
  );
}
