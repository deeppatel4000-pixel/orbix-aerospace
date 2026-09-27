import { ExternalLink } from "lucide-react";
import type { ReactNode } from "react";

/** The credit fields a visual record may carry (spec 12.3). */
export interface VehicleImageCredit {
  readonly credit?: string;
  readonly license?: string;
  /** Page stating the licence terms; the licence name links to it. */
  readonly licenseUrl?: string;
  readonly sourceUrl: string;
}

interface VehicleFigureProps {
  /** The vehicle's name, used to make the source link descriptive. */
  name: string;
  /** The photograph, already framed. */
  children: ReactNode;
  /** The visual record; when absent the figure has no caption. */
  visual?: VehicleImageCredit;
}

/**
 * "Public domain" reads as a phrase inside a sentence ("Photo: NASA, public
 * domain."), so only that one licence name is lower-cased. Licence codes such
 * as "CC BY-SA 4.0" are kept exactly as recorded.
 */
function formatLicense(license: string) {
  return license.replace(/^Public domain/, "public domain");
}

/**
 * The credit prefix: "Photo: NASA", or the credit as recorded when it already
 * says it is a photo ("U.S. Air Force photo by ..."). Undefined when no credit
 * is recorded, so nothing is invented.
 */
export function formatImageCredit(visual: VehicleImageCredit) {
  const credit = visual.credit?.trim();
  if (!credit) return undefined;
  return /\bphoto\b/i.test(credit) ? credit : `Photo: ${credit}`;
}

function CreditLine({ visual }: { visual: VehicleImageCredit }) {
  const credit = formatImageCredit(visual);
  const license = visual.license?.trim();

  if (!credit && !license) return null;

  const licenseNode = license ? (
    visual.licenseUrl ? (
      <a
        className="orbix-link"
        href={visual.licenseUrl}
        rel="noreferrer"
        target="_blank"
      >
        {formatLicense(license)}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    ) : (
      formatLicense(license)
    )
  ) : null;

  return (
    <>
      {credit ?? "Licence:"}
      {license ? (credit ? ", " : " ") : null}
      {licenseNode}.{" "}
    </>
  );
}

/**
 * A credited photograph (spec 12.3): the image inside a `<figure>` with a
 * `<figcaption>` giving the credit, the licence and a link to the source.
 */
export function VehicleFigure({ children, name, visual }: VehicleFigureProps) {
  return (
    <figure className="overflow-hidden rounded-md border border-border bg-surface">
      {children}
      {visual ? (
        <figcaption className="border-t border-border px-4 py-3 text-sm leading-6 text-muted">
          <CreditLine visual={visual} />
          <a
            className="orbix-link inline-flex items-center gap-1"
            href={visual.sourceUrl}
            rel="noreferrer"
            target="_blank"
          >
            Source
            <span className="sr-only">
              {" "}
              of the {name} photograph (opens in a new tab)
            </span>
            <ExternalLink aria-hidden="true" size={14} />
          </a>
        </figcaption>
      ) : null}
    </figure>
  );
}
