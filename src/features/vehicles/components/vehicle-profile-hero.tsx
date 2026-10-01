import type { ReactNode } from "react";

import { Container } from "@/components/layout/container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { PhotoHero, type VisualRecord } from "@/components/ui/photo-hero";
import { RecordRow, type RecordRowItem } from "@/components/ui/record-row";

import { heroCrop, type HeroCrop } from "./hero-crop";

export interface VehiclePageCrumb {
  readonly href?: string;
  readonly label: string;
}

/** The photograph and its crop per layout. */
export interface VehicleHeroVisual extends VisualRecord {
  readonly crop: HeroCrop;
}

interface VehicleProfileHeroProps {
  /** One action under the key figures, such as the compare link. */
  action?: ReactNode;
  breadcrumbs: readonly VehiclePageCrumb[];
  /** Sentence-case classification: the page's one plain kicker. */
  classification: string;
  lead: string;
  name: string;
  /**
   * `band` (default), for a landscape photograph of an airframe: the text,
   * then the photograph as a full-bleed band under it, so a wide airframe
   * is never cropped at the wingtips. `split`: from 64rem a landscape
   * plate beside the text, for a photograph close to square. `portrait`,
   * for a launch vehicle: from 64rem a 2:3 plate beside the text, so the
   * whole vehicle stands in view.
   */
  photo?: "band" | "portrait" | "split";
  /** Three or four key figures. */
  record: readonly RecordRowItem[];
  visual?: VehicleHeroVisual;
}

/**
 * The profile hero (spec 7, 11): breadcrumb, classification, name, lead,
 * the key figures as an open definition list and one action, all on the
 * page ground; the photograph as a hard-edged plate with its catalogue
 * caption under it. Nothing is set on the photograph.
 */
export function VehicleProfileHero({
  action,
  breadcrumbs,
  classification,
  lead,
  name,
  photo = "band",
  record,
  visual,
}: VehicleProfileHeroProps) {
  const content = (
    <>
      <Breadcrumbs items={breadcrumbs} />
      <div className="mt-8">
        <p className="orbix-kicker">{classification}</p>
      </div>
      <h1 className="orbix-h1 mt-3 text-foreground">{name}</h1>
      <p className="orbix-lead mt-6">{lead}</p>
      {/* Four across only in the full-width band layout. Beside a plate
          the text column is too narrow for four unbroken figures such as
          "118,000 kg" from 64rem, so they set two by two. */}
      <RecordRow
        className="mt-8"
        columns={visual && photo !== "band" ? 2 : 4}
        items={record}
      />
      {action ? <div className="mt-8">{action}</div> : null}
    </>
  );

  if (!visual) {
    return <Container className="py-16">{content}</Container>;
  }

  const crop = heroCrop(visual.crop);
  const isPortrait = photo === "portrait";

  return (
    <PhotoHero
      className={crop.className}
      layout={photo === "band" ? "band" : "split"}
      plate={isPortrait ? "portrait" : "landscape"}
      style={crop.style}
      visual={{ ...visual, objectPosition: crop.objectPosition }}
    >
      {content}
    </PhotoHero>
  );
}
