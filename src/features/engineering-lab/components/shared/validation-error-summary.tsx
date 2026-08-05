interface ValidationErrorSummaryProps {
  errors: readonly (string | undefined)[];
}

export function ValidationErrorSummary({
  errors,
}: ValidationErrorSummaryProps) {
  const uniqueErrors = Array.from(
    new Set(errors.filter((error): error is string => error !== undefined)),
  );

  if (uniqueErrors.length === 0) return null;

  return (
    <div
      className="mt-6 rounded-xl border border-signal/35 bg-signal/8 p-4"
      role="alert"
    >
      <p className="text-sm font-semibold text-signal">
        Review the calculator inputs
      </p>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-5 text-muted">
        {uniqueErrors.map((error) => (
          <li key={error}>{error}</li>
        ))}
      </ul>
    </div>
  );
}
