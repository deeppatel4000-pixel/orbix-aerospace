"use client";

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
      <label className="text-sm font-semibold" htmlFor={inputId}>
        {label}
      </label>
      <div className="relative mt-2">
        <input
          aria-describedby={error ? hintId + " " + errorId : hintId}
          aria-errormessage={error ? errorId : undefined}
          aria-invalid={Boolean(error)}
          className="min-h-12 w-full rounded-xl border border-border bg-background/55 px-4 py-3 pr-20 font-mono text-base text-foreground transition-colors outline-none placeholder:text-muted/55 focus:border-accent focus:ring-2 focus:ring-accent/15"
          id={inputId}
          inputMode="decimal"
          min="0"
          onChange={(event) => onChange(field, event.target.value)}
          required
          step="any"
          type="number"
          value={value}
        />
        <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 font-mono text-xs text-muted">
          {unit}
        </span>
      </div>
      <p className="mt-2 text-xs leading-5 text-muted" id={hintId}>
        {hint}
      </p>
      {error ? (
        <p className="mt-1.5 text-xs leading-5 text-signal" id={errorId}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
