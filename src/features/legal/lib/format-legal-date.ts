const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

/**
 * Formats an ISO calendar date (YYYY-MM-DD) as "September 27, 2026". Parsed by
 * hand so the result never shifts a day with the server or viewer time zone.
 */
export function formatLegalDate(isoDate: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!match) return isoDate;

  const [, year, month, day] = match;
  const monthName = MONTHS[Number(month) - 1];
  if (monthName === undefined) return isoDate;

  return `${monthName} ${Number(day)}, ${year}`;
}
