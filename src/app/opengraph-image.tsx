import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

import { creditLine, licenceLabel } from "@/components/ui/photo-hero";
import { siteLegal } from "@/config/site-legal";
import { siteConfig } from "@/config/site";
import { getAircraftVisual } from "@/features/aircraft/data/aircraft-visuals";
import { socialImageAlt, socialImageSize } from "@/lib/social-image";

/*
 * Site-wide social preview image, built like a v3 hero (spec 6, 7): the
 * wordmark and tagline on the near-black ground at the left, a hard-edged
 * public-domain photograph as a plate bleeding to the right edge, and a
 * one-line catalogue caption under the plate on the ground. The only
 * colour is a 2px by 48px space-division rule above the wordmark. No
 * gradients, no boxes, no text on the photograph.
 *
 * Values mirror `src/styles/orbix-tokens.css`, because ImageResponse cannot
 * read CSS custom properties. No local IBM Plex file ships with the repo,
 * so the type is the ImageResponse default sans, tracked tight.
 */

export const alt = socialImageAlt;
export const size = { ...socialImageSize };
export const contentType = "image/png";

const colors = {
  accent: "#5fd3f0",
  ground: "#07090d",
  ink: "#e8e4dc",
  inkFaint: "#7d8793",
  inkMuted: "#9aa3ad",
} as const;

const plate = getAircraftVisual("sr-71-blackbird")!;
const plateCaption = `SR-71B over the Sierra Nevada. ${creditLine(plate.credit)}, ${licenceLabel(plate.license).short.toLowerCase()}.`;

const PLATE_WIDTH = 600;
const PLATE_HEIGHT = 540;

/**
 * The plate as a JPEG data URL. ImageResponse cannot decode WebP, so the
 * site's WebP file is converted with sharp (installed with Next.js for its
 * image optimiser). If sharp is unavailable the card is set without the
 * plate rather than failing.
 */
async function plateDataUrl(): Promise<string | null> {
  try {
    const { default: sharp } = await import("sharp");
    const file = await readFile(join(process.cwd(), "public", plate.src));
    const jpeg = await sharp(file)
      .resize({ width: PLATE_WIDTH * 2, withoutEnlargement: true })
      .jpeg({ quality: 82 })
      .toBuffer();
    return `data:image/jpeg;base64,${jpeg.toString("base64")}`;
  } catch {
    return null;
  }
}

export async function renderSocialImage() {
  const photo = await plateDataUrl();

  return new ImageResponse(
    <div
      style={{
        backgroundColor: colors.ground,
        color: colors.ink,
        display: "flex",
        height: "100%",
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "88px 56px 48px 80px",
          width: photo
            ? socialImageSize.width - PLATE_WIDTH
            : socialImageSize.width,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              backgroundColor: colors.accent,
              display: "flex",
              height: 2,
              marginBottom: 36,
              width: 48,
            }}
          />
          <div
            style={{
              display: "flex",
              fontSize: 120,
              fontWeight: 700,
              letterSpacing: -5,
              lineHeight: 1,
            }}
          >
            {siteConfig.wordmark}
          </div>
          <div
            style={{
              color: colors.ink,
              display: "flex",
              fontSize: 38,
              letterSpacing: -0.4,
              lineHeight: 1.25,
              marginTop: 32,
            }}
          >
            {siteConfig.tagline}
          </div>
        </div>
        <div
          style={{
            color: colors.inkMuted,
            display: "flex",
            fontSize: 24,
            lineHeight: 1.4,
          }}
        >
          {`An educational project by ${siteLegal.operatorName}`}
        </div>
      </div>

      {photo ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: PLATE_WIDTH,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse renders plain img elements only */}
          <img
            alt=""
            height={PLATE_HEIGHT}
            src={photo}
            style={{
              height: PLATE_HEIGHT,
              objectFit: "cover",
              objectPosition: plate.objectPosition,
              width: PLATE_WIDTH,
            }}
            width={PLATE_WIDTH}
          />
          <div
            style={{
              color: colors.inkFaint,
              display: "flex",
              fontSize: 18,
              lineHeight: 1.3,
              paddingTop: 16,
            }}
          >
            {plateCaption}
          </div>
        </div>
      ) : null}
    </div>,
    size,
  );
}

export default function OpengraphImage() {
  return renderSocialImage();
}
