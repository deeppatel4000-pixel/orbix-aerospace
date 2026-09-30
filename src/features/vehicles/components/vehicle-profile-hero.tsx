import type { CSSProperties, ReactNode } from "react";

import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Eyebrow } from "@/components/ui/eyebrow";
import { PhotoHero, type VisualRecord } from "@/components/ui/photo-hero";
import { RecordRow, type RecordRowItem } from "@/components/ui/record-row";
import { Container } from "@/components/layout/container";
import { cn } from "@/lib/cn";

import {
  responsiveHeroPosition,
  STOPGAP_PHOTO_HERO_PHONE_TALL,
  STOPGAP_PHOTO_HERO_RIGHT,
  STOPGAP_PHOTO_HERO_SIDE,
  STOPGAP_RECORD_ROW,
  type ResponsiveObjectPosition,
} from "./primitive-stopgaps";

export interface VehiclePageCrumb {
  readonly href?: string;
  readonly label: string;
}

/** The photograph, its crop per breakpoint and its intrinsic size. */
export interface VehicleHeroVisual extends VisualRecord {
  readonly height: number;
  readonly position: ResponsiveObjectPosition;
  readonly width: number;
}

interface VehicleProfileHeroProps {
  /** One action under the record row, such as the compare link. */
  action?: ReactNode;
  breadcrumbs: readonly VehiclePageCrumb[];
  /** Sentence-case classification, shown as the eyebrow. */
  classification: string;
  lead: string;
  name: string;
  /**
   * `side` (default), for a landscape photograph of an airframe: a banner
   * across the top from 48rem, then from 64rem the photograph on the right
   * at its own aspect, uncropped, beside the text (`STOPGAP_PHOTO_HERO_SIDE`).
   * `right`, for a portrait photograph of a launch vehicle: from 48rem the
   * photograph stands on the right at the hero's height with a feathered
   * left edge; below 48rem a 3:4 plate. The hero is the one place a
   * profile shows its photograph large (spec 9), so the sections below do
   * not repeat it.
   */
  photoPlacement?: "right" | "side";
  /** Three or four key figures (spec 8). */
  record: readonly RecordRowItem[];
  visual?: VehicleHeroVisual;
}

/**
 * The profile hero (spec 9): the photograph with the breadcrumb,
 * classification, display name, lead and record row, and the photo credit
 * at the bottom right. Without a photograph the same text sits on the page
 * ground.
 */
export function VehicleProfileHero({
  action,
  breadcrumbs,
  classification,
  lead,
  name,
  photoPlacement = "side",
  record,
  visual,
}: VehicleProfileHeroProps) {
  const isSide = photoPlacement === "side";
  const content = (
    <>
      <Breadcrumbs items={breadcrumbs} />
      <Eyebrow className="mt-8">{classification}</Eyebrow>
      <h1
        className={cn(
          "orbix-h1 mt-4 text-foreground",
          !isSide && "lg:max-w-[38rem]",
        )}
      >
        {name}
      </h1>
      {/*
       * Beside a portrait photograph the lead and the record row stop at
       * 38rem, clear of the plate. Beside an aircraft photograph the whole
       * column is 32 to 34rem, and the record row stays a 2x2 grid.
       */}
      <p className={cn("orbix-lead mt-6", !isSide && "lg:max-w-[38rem]")}>
        {lead}
      </p>
      <RecordRow
        className={cn(
          "mt-8",
          !isSide && "lg:max-w-[38rem]",
          STOPGAP_RECORD_ROW,
          isSide && String.raw`lg:[&_.orbix-record-row\_\_list]:grid-cols-2`,
        )}
        items={record}
      />
      {action ? <div className="mt-8">{action}</div> : null}
    </>
  );

  if (!visual) {
    return <Container className="py-16">{content}</Container>;
  }

  const position = responsiveHeroPosition(visual.position);

  return (
    <PhotoHero
      className={cn(
        position.className,
        isSide
          ? STOPGAP_PHOTO_HERO_SIDE
          : cn(STOPGAP_PHOTO_HERO_RIGHT, STOPGAP_PHOTO_HERO_PHONE_TALL),
      )}
      plate={isSide ? "landscape" : "portrait"}
      style={
        {
          ...position.style,
          // A plain number: it divides a length in `STOPGAP_PHOTO_HERO_SIDE`.
          "--orbix-hero-aspect": (visual.width / visual.height).toFixed(4),
        } as CSSProperties
      }
      visual={{ ...visual, objectPosition: position.objectPosition }}
    >
      {content}
    </PhotoHero>
  );
}
