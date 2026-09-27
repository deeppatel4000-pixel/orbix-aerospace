const numberFormat = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

/** Grouped thousands, at most two decimals: "384,400", "1.5". */
export function formatShowcaseNumber(value: number): string {
  return numberFormat.format(value);
}
