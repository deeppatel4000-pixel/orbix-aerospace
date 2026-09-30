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
  STOPGAP_PHOTO_HERO_SIDE,
  STOPGAP_RECORD_ROW,
  STOPGAP_RECORD_ROW_SIDE,
  STOPGAP_RECORD_ROW_WIDE,
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
   * across the top from 48rem, then from 80rem the photograph full-bleed
   * behind the right of the content, off the window's right edge
   * (`STOPGAP_PHOTO_HERO_SIDE`).
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
       * 38rem, clear of the plate, and the record row is one row from 64rem.
       * On an aircraft profile the record row is 2x2, one row of four from
       * 64rem.
       */}
      <p className={cn("orbix-lead mt-6", !isSide && "lg:max-w-[38rem]")}>
        {lead}
      </p>
      <RecordRow
        className={cn(
          "mt-8",
          !isSide && "lg:max-w-[38rem]",
          STOPGAP_RECORD_ROW,
          isSide ? STOPGAP_RECORD_ROW_SIDE : STOPGAP_RECORD_ROW_WIDE,
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
        // Top-aligned on every profile, so the breadcrumb and the name sit
        // at the same height (6rem into the hero from 48rem) from one
        // profile to the next; the photograph still fills the hero.
        "md:justify-start",
        isSide ? STOPGAP_PHOTO_HERO_SIDE : STOPGAP_PHOTO_HERO_PHONE_TALL,
        // Rocket profiles (placement="right") are top-aligned, so the full
        // min(88svh, 60rem) hero left a tall empty band under the actions.
        // The portrait photograph is height-bound, so the whole vehicle
        // still shows at this height.
        !isSide && "md:min-h-[min(88svh,44rem)]",
      )}
      placement={isSide ? "behind" : "right"}
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
