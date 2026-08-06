# ORBIX official brand assets

These files are the official, user-supplied ORBIX identity. Application components must use these assets without redrawing, substituting, or generating alternative marks.

| Application asset                     | Source asset          | Intended use                                          | SHA-256                                                            |
| ------------------------------------- | --------------------- | ----------------------------------------------------- | ------------------------------------------------------------------ |
| `/public/brand/orbix-emblem.png`      | `Orbix Emblem.png`    | Circular identity artwork and future presentation use | `3385FC8B8F0D5C9F468707BABBF7C5EAE19361B3F621E768B46CE912F65FB220` |
| `/public/brand/orbix-app-logo.png`    | `Orbix App Logo.png`  | Compact application identity and icon source          | `ACB966DB53FF44258C9DCE41056153F29E5105A51A9A12798B85E461B8E8341D` |
| `/public/brand/orbix-full-logo.png`   | `Orbix Full Logo.png` | Archival full-resolution wordmark artwork             | `C061B5D8FB53F526B8A5EDDABB691BA2A6A26A4C61323080714E60EDCA7E2502` |
| `/public/brand/orbix-brand-suite.png` | `Orbix All Three.png` | OpenGraph and portfolio social-preview presentation   | `ED4B2F2C19E1D9D341ECC693431EBB5900B05EF429A6D194DF623B7BA002C5BC` |

The four source-named public PNG files preserve the supplied source bytes. `/public/brand/orbix-wordmark.png` and `/public/brand/orbix-app-mark.png` are presentation crops of the supplied full logo and app logo respectively. The crops retain the complete marks with safe space and remove only excess surrounding background so responsive layouts never clip or shrink the identity. `src/app/icon.png` and `src/app/favicon.ico` use that same complete app-mark crop.

## Usage rules

- Do not recolor, redraw, rotate, or distort the emblem or wordmark.
- Preserve safe space and keep the mark on dark, high-contrast surfaces.
- Use the full wordmark where horizontal space permits and the emblem at compact sizes.
- Render both marks with contained sizing; never zoom them inside an overflow-hidden frame.
- Keep surrounding lighting restrained so the silver, cyan, and violet identity remains legible.
- Never place engineering status, safety, or feasibility meaning on the logo itself.
