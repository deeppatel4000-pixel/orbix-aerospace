"use client";

/**
 * One numeric parameter — 23 modules render every input through this.
 *
 * The accessibility contract was already right and is untouched: a real
 * `<label htmlFor>`, `aria-describedby` pointing at the hint (and the error
 * when present), `aria-errormessage`, `aria-invalid`, `inputMode="decimal"`,
 * `step="any"`, and a 48px target. Parsing and validation are unchanged; this
 * component has never done either.
 *
 * What changed is legibility. The unit moved out of the field and up beside
 * the label, hint and error text moved from 12px to 14px, and the invalid
 * state now marks the field border as well as printing a message, so the
 * error is not carried by the message alone.
 */

interface CalculatorNumberFieldProps<Field extends string> {
  error?: string;
  field: Field;
  hint: string;
  idPrefix: string;
  label: string;
  onChange: (field: Field, value: string) => void;
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
  unit,
  value,
}: CalculatorNumberFieldProps<Field>) {
  const inputId = idPrefix + "-" + field;
  const hintId = inputId + "-hint";
  const errorId = inputId + "-error";

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label className="text-sm font-semibold" htmlFor={inputId}>
          {label}
        </label>
        {/* The unit sits with the label rather than floating inside the input.
         * Inside, it had to be dodged with 5rem of right padding, and a long
         * value ran underneath it; here it is legible at normal size and the
         * field keeps its full width for the number. */}
        <span className="font-mono text-xs text-muted">{unit}</span>
      </div>
      <div className="relative mt-2">
        <input
          aria-describedby={error ? hintId + " " + errorId : hintId}
          aria-errormessage={error ? errorId : undefined}
          aria-invalid={Boolean(error)}
          className="min-h-12 w-full rounded-md border border-border bg-background/55 px-4 py-3 font-mono text-base text-foreground tabular-nums transition-colors outline-none placeholder:text-muted/55 focus:border-accent focus:ring-2 focus:ring-accent/15 aria-[invalid=true]:border-signal/70"
          id={inputId}
          inputMode="decimal"
          min="0"
          onChange={(event) => onChange(field, event.target.value)}
          required
          step="any"
          type="number"
          value={value}
        />
      </div>
      <p className="mt-2 text-sm leading-6 text-muted" id={hintId}>
        {hint}
      </p>
      {error ? (
        <p className="mt-1.5 text-sm leading-6 text-signal" id={errorId}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
