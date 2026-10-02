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

/**
 * An orbital or flight altitude as a value and unit: kilometers from 1 km
 * up, meters below. The orbit diagrams label altitudes in km, so every
 * readout beside them uses the same unit.
 */
export function altitudeReadout<T extends number | undefined>(
  metres: T,
): { readonly unit: "km" | "m"; readonly value: T } {
  if (metres === undefined || Math.abs(metres) < 1_000) {
    return { unit: "m", value: metres };
  }

  return { unit: "km", value: (metres / 1_000) as T };
}

/** An altitude as display text, for example "408 km". */
export function formatLabAltitude(metres: number): string {
  const { unit, value } = altitudeReadout(metres);
  return `${formatLabValue(value)} ${unit}`;
}
