/**
 * Short photo credits for Compare, where a photograph appears as a small
 * thumbnail. Full credits (photographer, source link, licence link) are on
 * `/credits`. The short form keeps the agency for public-domain government
 * works and the author for Creative Commons works, as CC BY requires.
 */

const PUBLIC_DOMAIN_PREFIX = "Public domain";

function shortCreditSource(credit: string): string {
  if (credit.startsWith("U.S. Air Force")) return "USAF";
  if (credit.startsWith("NASA")) return "NASA";
  return credit;
}

export function shortLicense(license: string): string {
  return license.startsWith(PUBLIC_DOMAIN_PREFIX) ? "public domain" : license;
}

/** One line for a tile: "USAF, public domain" or "Steve Jurvetson, CC BY 2.0". */
export function shortCredit(credit: string, license: string): string {
  return shortCreditSource(credit) + ", " + shortLicense(license);
}

interface CreditedPhoto {
  readonly credit: string;
  readonly license: string;
  readonly licenseUrl: string;
  readonly name: string;
}

/** One licence group of a grouped credit line. */
export interface CreditGroup {
  /** "USAF (F-22 Raptor, B-2 Spirit), NASA (SR-71 Blackbird)" */
  readonly sources: string;
  /** Short licence: "public domain" or "CC BY 2.0". */
  readonly license: string;
  /**
   * Licence deed to link, for Creative Commons works only: CC BY asks for a
   * link to the licence next to the credit. Public-domain works need none.
   */
  readonly licenseUrl?: string;
}

/**
 * A set of photos grouped by licence then source, for one credit line:
 * "USAF (F-22 Raptor, B-2 Spirit), NASA (SR-71 Blackbird), public domain".
 */
export function groupedCredits(
  photos: readonly CreditedPhoto[],
): readonly CreditGroup[] {
  const byLicense = new Map<
    string,
    { sources: Map<string, string[]>; licenseUrl?: string }
  >();

  for (const photo of photos) {
    const license = shortLicense(photo.license);
    const source = shortCreditSource(photo.credit);
    const group = byLicense.get(license) ?? {
      licenseUrl: photo.license.startsWith(PUBLIC_DOMAIN_PREFIX)
        ? undefined
        : photo.licenseUrl,
      sources: new Map<string, string[]>(),
    };
    group.sources.set(source, [
      ...(group.sources.get(source) ?? []),
      photo.name,
    ]);
    byLicense.set(license, group);
  }

  return [...byLicense.entries()].map(([license, group]) => ({
    license,
    licenseUrl: group.licenseUrl,
    sources: [...group.sources.entries()]
      .map(([source, names]) => source + " (" + names.join(", ") + ")")
      .join(", "),
  }));
}
