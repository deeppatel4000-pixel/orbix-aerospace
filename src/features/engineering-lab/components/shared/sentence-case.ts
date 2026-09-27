/**
 * Formats a computed label in sentence case (spec 13.2): the first letter is
 * uppercased and the rest is left as written, so "above-one" style regime
 * keys render as "Above one" rather than title case.
 */
export function toSentenceCase(value: string): string {
  if (value.length === 0) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}
