/**
 * Zero-padded two-digit number: 1 becomes "01". Only for real reference
 * numbers such as Engineering Lab tool IDs (spec 3.7), never to decorate a
 * list or a section heading.
 */
export function formatIndexNumber(value: number): string {
  return String(value).padStart(2, "0");
}
