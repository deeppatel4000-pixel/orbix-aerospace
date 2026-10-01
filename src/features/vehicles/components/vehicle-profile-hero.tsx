import type { ReactNode } from "react";

import { Container } from "@/components/layout/container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { PhotoHero, type VisualRecord } from "@/components/ui/photo-hero";
import { type RecordRowItem } from "@/components/ui/record-row";
import { SpecPanel } from "@/components/ui/spec-panel";
import { cn } from "@/lib/cn";

import { keepDesignations } from "@/lib/designations";

import { heroCrop, type HeroCrop, portraitPlate } from "./hero-crop";

export interface VehiclePageCrumb {
  readonly href?: string;
  readonly label: string;
}

/** The photograph and its crop per layout. */
export interface VehicleHeroVisual extends VisualRecord {
  readonly crop: HeroCrop;
  /** Intrinsic size of the file, for a portrait plate in its own proportions. */
  readonly height?: number;
  readonly width?: number;
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
  // In the band layout the photograph runs under the text, so from 64rem
  // the key figures and action sit to the right of the name and lead
  // instead of leaving the right half of the text row empty.
  const isBand = photo === "band" && Boolean(visual);
  const content = (
    <>
      <Breadcrumbs items={breadcrumbs} />
      <div
        className={cn(
          isBand && "lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-6",
        )}
      >
        <div className={cn(isBand && "lg:col-span-7")}>
          <div className="mt-8">
            <p className="orbix-kicker">{classification}</p>
          </div>
          <h1 className="orbix-h1 mt-3 text-foreground">{name}</h1>
          <p className="orbix-lead mt-6">{keepDesignations(lead)}</p>
        </div>
        <div className={cn(isBand && "lg:col-span-5 lg:col-start-8")}>
          {/* The first two figures at the registry's featured size (the
              same definition list as the "Pictured" line), the rest at the
              base size. Two by two in every layout: the featured pair on
              one row, the rest on the next, so a featured figure such as
              "50,000 ft" never runs into its neighbour and small figures
              never sit beside big ones. */}
          <SpecPanel
            className="mt-8"
            columns={2}
            items={record.map((item, index) => ({
              ...item,
              primary: index < 2,
            }))}
          />
          {action ? <div className="mt-8">{action}</div> : null}
        </div>
      </div>
    </>
  );

  if (!visual) {
    return <Container className="py-16">{content}</Container>;
  }

  const crop = heroCrop(visual.crop);
  const isPortrait = photo === "portrait";
  const plate =
    isPortrait && visual.width && visual.height
      ? portraitPlate({ height: visual.height, width: visual.width })
      : undefined;

  return (
    <PhotoHero
      // The band's text runs the full container width from 64rem, so the
      // figures can sit beside the lead.
      className={cn(
        crop.className,
        plate?.className,
        isBand && "lg:[&>div:first-child>div]:max-w-none",
      )}
      layout={photo === "band" ? "band" : "split"}
      plate={isPortrait ? "portrait" : "landscape"}
      style={{ ...crop.style, ...plate?.style }}
      visual={{ ...visual, objectPosition: crop.objectPosition }}
    >
      {content}
    </PhotoHero>
  );
}
