import { CircleDot, Minus } from "lucide-react";

export interface DesignConstraintCardProps {
  readonly description?: string;
  readonly label: string;
  readonly unit?: string;
  readonly value?: number | string;
}

const parameterFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
});

export function DesignConstraintCard({
  description,
  label,
  unit,
  value,
}: DesignConstraintCardProps) {
  const isReported = value !== undefined;

  return (
    <article
      aria-label={`${label}: ${isReported ? "reported mission parameter" : "not reported"}`}
      className="rounded-xl border border-white/10 bg-[#081419] p-4 transition-colors outline-none hover:border-accent/20 focus-visible:ring-2 focus-visible:ring-accent motion-reduce:transition-none"
      data-parameter-availability={isReported ? "reported" : "not-reported"}
      tabIndex={0}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[0.52rem] tracking-[0.11em] text-accent uppercase">
            Mission parameter
          </p>
          <h4 className="mt-1 text-sm font-semibold text-[#cdd9db]">{label}</h4>
        </div>
        <span
          className={
            "inline-flex items-center gap-1.5 rounded-full border px-2 py-1 font-mono text-[0.48rem] tracking-[0.07em] uppercase " +
            (isReported
              ? "border-accent/20 bg-accent/5 text-accent"
              : "border-white/10 bg-white/3 text-[#71868c]")
          }
        >
          {isReported ? (
            <CircleDot aria-hidden="true" size={9} />
          ) : (
            <Minus aria-hidden="true" size={9} />
          )}
          {isReported ? "Reported" : "Not Reported"}
        </span>
      </div>
      <p className="mt-4 font-mono text-lg font-semibold text-[#e1e9ea]">
        <output>
          {typeof value === "number"
            ? parameterFormatter.format(value)
            : (value ?? "Not Reported")}
          {isReported && unit ? (
            <span className="ml-1 text-[0.65rem] font-normal text-[#7f959a]">
              {unit}
            </span>
          ) : null}
        </output>
      </p>
      {description ? (
        <p className="mt-3 text-xs leading-5 text-[#758b90]">{description}</p>
      ) : null}
    </article>
  );
}
