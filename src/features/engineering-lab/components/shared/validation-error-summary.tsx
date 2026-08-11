/**
 * The submit-time summary of everything wrong with the form — 23 consumers.
 *
 * Each field already renders its own message next to the input it belongs to,
 * so this is a roll-up, not the primary reporting channel. It was a filled
 * amber panel, which gave a routine "enter a positive number" the weight of a
 * system fault; it is now a marked rule beside the list. `role="alert"` is
 * unchanged — the summary appears in response to a submit the reader just
 * made, which is exactly when an assertive announcement is warranted — and the
 * list text moved up from 12px to 14px, since an error nobody can read is not
 * a kindness.
 */
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
    <div className="mt-6 border-l-2 border-signal/70 pl-4" role="alert">
      <p className="text-sm font-semibold text-signal">
        Review the calculator inputs
      </p>
      <ul className="text-muted-strong mt-2 list-disc space-y-1 pl-5 text-sm leading-6">
        {uniqueErrors.map((error) => (
          <li key={error}>{error}</li>
        ))}
      </ul>
    </div>
  );
}
