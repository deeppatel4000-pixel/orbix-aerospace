import { socialImageAlt, socialImageSize } from "@/lib/social-image";

import { renderSocialImage } from "./opengraph-image";

// Same image as the Open Graph preview. Route segment config must be
// declared in this file, so the values are assigned here rather than
// re-exported.
export const alt = socialImageAlt;
export const size = { ...socialImageSize };
export const contentType = "image/png";

export default function TwitterImage() {
  return renderSocialImage();
}
