# ORBIX screenshots

Screenshots of the running application, used in the project [README](../../../README.md). Each one
is an unedited browser capture of a real page. None is a mockup or generated image.

Captured on 30 September 2026 from a local production build (`next build` and `next start`) of
the `redesign/anti-vibe-legal` branch with the v2 design, with Playwright (Chromium) at a device
scale factor of 2 and reduced motion. Scrollbars were hidden before capture.

All eight are indexed PNGs (IHDR colour type 3). Seven are 256-entry palettes (bit depth 8) encoded
with sharp's libimagequant, `png({ palette: true, colours: 256, effort: 10, compressionLevel: 9 })`
with `dither: 0.5`, except `verification.png`, recaptured after the sixth pass with `dither: 1.0`.
`aircraft-sr-71.png` (446 KB) was recaptured after the sixth pass and quantized with Pillow to 128
colours (fast octree, full Floyd-Steinberg dithering, bit depth 8); full dithering keeps the snow
free of visible banding at that size. Seven files are 218 to 570 KB, under the 600 KB target.

`home.png` (1.44 MB) is still over it. Full dithering makes it larger (sharp at 256 colours and
`dither: 1.0`: 1.45 MB), and every encoding under 600 KB tried on 2026-09-30 posterized the dark
hero overlay: sharp with a lower `quality` (12 to 14 colours), and Pillow at 128 to 256 colours
with an octree palette (flat grey patches over the aircraft). Note that sharp's `colours: 96` or
`128` writes a 4-bit PNG with 16 colours. Whether to accept the size or the posterization is an
owner decision.

The SR-71 profile captures are scrolled so the breadcrumb sits under the header. On the profile the
photograph is a framed plate beside the text (desktop) or above it (phone), so it no longer reads
as a copy of the home hero.

| File                                  | Page                        | Viewport | State                                                                                                   |
| ------------------------------------- | --------------------------- | -------- | ------------------------------------------------------------------------------------------------------- |
| `home.png`                            | `/`                         | 1440x900 | Top of page                                                                                             |
| `home-mobile.png`                     | `/`                         | 390x844  | Top of page                                                                                             |
| `aircraft-sr-71.png`                  | `/aircraft/sr-71-blackbird` | 1440x900 | Breadcrumb under the header: title, record figures and photograph, then the section navigation          |
| `aircraft-sr-71-mobile.png`           | `/aircraft/sr-71-blackbird` | 390x844  | Scrolled past the photograph to the breadcrumb, title, record figures and section navigation            |
| `compare-aircraft.png`                | `/compare`                  | 1440x900 | SR-71 Blackbird, F-22 Raptor and F-15 Eagle selected, scrolled to the spec sheet heading                |
| `engineering-lab-rocket-equation.png` | `/engineering-lab`          | 1440x900 | Rocket equation with 100,000 kg, 40,000 kg and 300 s entered, scrolled to the tool; result 2,695.72 m/s |
| `verification.png`                    | `/verification`             | 1440x900 | Scrolled to the vis-viva orbital speed check                                                            |
| `build-log.png`                       | `/build-log`                | 1440x900 | Top of page                                                                                             |

When the pages change, recapture from a current build at the same viewports and replace the files
under the same names, so the README links keep working.
