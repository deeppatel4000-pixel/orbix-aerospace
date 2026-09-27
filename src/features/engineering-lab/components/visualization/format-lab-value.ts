const standardFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

const smallValueFormatter = new Intl.NumberFormat("en-US", {
  maximumSignificantDigits: 3,
});

/**
 * Formats a computed value for display in the lab's presentation views.
 *
 * Two decimal places suit most values, but a small non-zero value (a TPS
 * mass of 0.001 kg, say) would round to "0" and read as zero. Magnitudes
 * below 1 keep three significant figures instead, so every view shows the
 * same non-zero value the calculation produced.
 */
export function formatLabValue(value: number): string {
  if (value !== 0 && Math.abs(value) < 1) {
    return smallValueFormatter.format(value);
  }

  return standardFormatter.format(value);
}
