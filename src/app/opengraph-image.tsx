import { ImageResponse } from "next/og";

import { siteLegal } from "@/config/site-legal";
import { siteConfig } from "@/config/site";
import { socialImageAlt, socialImageSize } from "@/lib/social-image";

/*
 * Site-wide social preview image (design v2 palette: blue-black ground,
 * space-division cyan accent; values mirror `src/styles/orbix-tokens.css`
 * because ImageResponse cannot read CSS custom properties). Typographic
 * only: no photos, no gradients. No local IBM Plex file ships with the repo,
 * so the image uses the ImageResponse default sans.
 */

export const alt = socialImageAlt;
export const size = { ...socialImageSize };
export const contentType = "image/png";

const colors = {
  accent: "#5fd3f0",
  border: "#22344d",
  ground: "#03060c",
  textMuted: "#91a3b7",
  textPrimary: "#f2f6fb",
  textSecondary: "#c1ccd7",
} as const;

export function renderSocialImage() {
  return new ImageResponse(
    <div
      style={{
        backgroundColor: colors.ground,
        color: colors.textPrimary,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "space-between",
        padding: "88px 96px",
        width: "100%",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            backgroundColor: colors.accent,
            display: "flex",
            height: 6,
            marginBottom: 40,
            width: 96,
          }}
        />
        <div
          style={{
            display: "flex",
            fontSize: 132,
            letterSpacing: 6,
            lineHeight: 1,
          }}
        >
          {siteConfig.wordmark}
        </div>
        <div
          style={{
            color: colors.textSecondary,
            display: "flex",
            fontSize: 48,
            lineHeight: 1.25,
            marginTop: 36,
            maxWidth: 900,
          }}
        >
          {siteConfig.tagline}
        </div>
      </div>
      <div
        style={{
          borderTop: `2px solid ${colors.border}`,
          color: colors.textMuted,
          display: "flex",
          fontSize: 32,
          paddingTop: 32,
        }}
      >
        {`An educational project by ${siteLegal.operatorName}`}
      </div>
    </div>,
    size,
  );
}

export default function OpengraphImage() {
  return renderSocialImage();
}
