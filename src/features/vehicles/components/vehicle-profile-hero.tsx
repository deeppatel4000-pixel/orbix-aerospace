import type { ReactNode } from "react";

import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Eyebrow } from "@/components/ui/eyebrow";
import { PhotoHero, type VisualRecord } from "@/components/ui/photo-hero";
import { RecordRow, type RecordRowItem } from "@/components/ui/record-row";
import { Container } from "@/components/layout/container";
import { cn } from "@/lib/cn";

import {
  STOPGAP_PHOTO_HERO_RIGHT,
  STOPGAP_RECORD_ROW,
} from "./primitive-stopgaps";

export interface VehiclePageCrumb {
  readonly href?: string;
  readonly label: string;
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
   * `behind` (default): the photo spans the hero behind the text.
   * `right`: from 64rem the photo fills the right half with a feathered
   * left edge, for a portrait photograph whose vehicle stands in the middle
   * of the frame and would otherwise sit behind the lead. Below 48rem it
   * also makes the framed plate portrait (4:5), so a tall vehicle is shown
   * whole.
   */
  photoPlacement?: "behind" | "right";
  /** Three or four key figures (spec 8). */
  record: readonly RecordRowItem[];
  /** The photograph with the crop to use behind the text. */
  visual?: VisualRecord;
}

/**
 * The profile hero (spec 9): a full-bleed photograph behind the breadcrumb,
 * classification, display name, lead and record row, with the photo credit
 * at the bottom right. Without a photograph the same text sits on the page
 * ground.
 */
export function VehicleProfileHero({
  action,
  breadcrumbs,
  classification,
  lead,
  name,
  photoPlacement = "behind",
  record,
  visual,
}: VehicleProfileHeroProps) {
  const content = (
    <>
      <Breadcrumbs items={breadcrumbs} />
      <Eyebrow className="mt-8">{classification}</Eyebrow>
      <h1
        className={cn(
          "orbix-h1 mt-4 text-foreground",
          photoPlacement === "right" && "lg:max-w-[38rem]",
        )}
      >
        {name}
      </h1>
      {/*
       * The lead and the record row stop at 38rem: at 1440px the hero
       * overlay thins past about half the width, and wider lines there fell
       * below 4.5:1 over bright photographs. Below 64rem the record row is
       * a 2x2 grid instead of wrapping three and one.
       */}
      <p className="orbix-lead mt-6 lg:max-w-[38rem]">{lead}</p>
      <RecordRow
        className={cn("mt-8 lg:max-w-[38rem]", STOPGAP_RECORD_ROW)}
        items={record}
      />
      {action ? <div className="mt-8">{action}</div> : null}
    </>
  );

  return visual ? (
    <PhotoHero
      className={
        photoPlacement === "right" ? STOPGAP_PHOTO_HERO_RIGHT : undefined
      }
      plate={photoPlacement === "right" ? "portrait" : "landscape"}
      visual={visual}
    >
      {content}
    </PhotoHero>
  ) : (
    <Container className="py-16">{content}</Container>
  );
}
