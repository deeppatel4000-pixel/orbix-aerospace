import { formatLabValue } from "../visualization/format-lab-value";
export interface DesignConstraintCardProps {
  readonly description?: string;
  readonly label: string;
  readonly unit?: string;
  readonly value?: number | string;
}

/**
 * One reported mission parameter as a definition-list row. Render inside a
 * `<dl>`. A missing value reads "Not reported" in muted text.
 */
export function DesignConstraintCard({
  description,
  label,
  unit,
  value,
}: DesignConstraintCardProps) {
  const isReported = value !== undefined;

  return (
    <div
      className="flex flex-wrap items-baseline justify-between gap-x-4 border-t border-border-subtle py-2 text-sm"
      data-parameter-availability={isReported ? "reported" : "not-reported"}
    >
      <dt className="text-muted">{label}</dt>
      <dd className="text-right">
        <output
          className={
            !isReported
              ? "text-muted"
              : typeof value === "number"
                ? "orbix-data text-foreground"
                : "text-foreground"
          }
        >
          {typeof value === "number"
            ? formatLabValue(value)
            : (value ?? "Not reported")}
          {isReported && unit ? (
            <span className="ml-1 text-muted">{unit}</span>
          ) : null}
        </output>
      </dd>
      {description ? (
        <dd className="mt-1 basis-full text-sm leading-6 text-muted">
          {description}
        </dd>
      ) : null}
    </div>
  );
}
