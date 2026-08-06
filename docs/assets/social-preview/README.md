# GitHub social preview specification

This directory documents the future authentic ORBIX repository preview asset. No placeholder image
is committed because a social card should represent the working product rather than a fabricated UI.

## Canvas

- **Dimensions:** 1280 × 640 pixels
- **Format:** PNG or JPEG accepted by GitHub; prefer an optimized PNG for interface detail
- **Safe area:** Keep essential text and the primary interface subject at least 80 pixels from every
  edge so link previews can crop safely.

## Recommended composition

1. Use an authentic Mission Control or showcase capture as the visual anchor.
2. Place the `ORBIX` wordmark prominently with restrained orbital-ring or grid accents.
3. Include the tagline: **Advanced Aerospace Engineering Laboratory**.
4. Use the existing blue, cyan, white, and dark mission-control palette.
5. Keep interface text large enough to survive thumbnail rendering.
6. Avoid claims about certification, mission feasibility, or real flight operations.

## Capture and publication checklist

- Verify the represented build with `npm run validate`.
- Confirm that no personal data, browser chrome, development overlays, or console output is visible.
- Check the image at full size and at a 320-pixel-wide thumbnail.
- Add the final asset here with its source commit documented.
- Upload it through GitHub repository **Settings → General → Social preview**.

The preview should communicate aerospace engineering depth and professional presentation without
implying operational or certified software.
