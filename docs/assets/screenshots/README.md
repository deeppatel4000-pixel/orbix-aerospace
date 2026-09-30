# ORBIX screenshots

Screenshots of the running application, used in the project [README](../../../README.md). Each one
is an unedited browser capture of a real page. None is a mockup or generated image.

Captured on 30 September 2026 from a local production build (`next build` and `next start`) of
the `redesign/anti-vibe-legal` branch with the v2 design, after the last integration pass, with
Playwright (Chromium) at a device scale factor of 2 and reduced motion. Scrollbars were hidden before
capture.

Six files are indexed PNGs (256-entry palette, bit depth 8) encoded with sharp's libimagequant,
`png({ palette: true, colours: 256, effort: 10, compressionLevel: 9, dither: 0.5 })`. The two
photograph-led desktop captures, `home.jpg` and `aircraft-sr-71.jpg`, are JPEG (sharp with
mozjpeg, quality 82, 4:4:4 chroma): as palette PNGs they were 1.44 MB and 1.18 MB, and every palette
encoding under 600 KB posterized the dark photograph. All eight files are 218 to 563 KB, under the
600 KB target.

The SR-71 profile captures are scrolled so the breadcrumb sits under the header. On the desktop
profile the photograph sits on the right of the text with a feathered left edge; the phone capture
is scrolled past it to the title and record figures.

| File                                  | Page                        | Viewport | State                                                                                                   |
| ------------------------------------- | --------------------------- | -------- | ------------------------------------------------------------------------------------------------------- |
| `home.jpg`                            | `/`                         | 1440x900 | Top of page                                                                                             |
| `home-mobile.png`                     | `/`                         | 390x844  | Top of page                                                                                             |
| `aircraft-sr-71.jpg`                  | `/aircraft/sr-71-blackbird` | 1440x900 | Breadcrumb under the header: title, record figures and photograph, then the section navigation          |
| `aircraft-sr-71-mobile.png`           | `/aircraft/sr-71-blackbird` | 390x844  | Scrolled past the photograph to the breadcrumb, title, record figures and section navigation            |
| `compare-aircraft.png`                | `/compare`                  | 1440x900 | SR-71 Blackbird, F-22 Raptor and F-15 Eagle selected, scrolled to the spec sheet heading                |
| `engineering-lab-rocket-equation.png` | `/engineering-lab`          | 1440x900 | Rocket equation with 100,000 kg, 40,000 kg and 300 s entered, scrolled to the tool; result 2,695.72 m/s |
| `verification.png`                    | `/verification`             | 1440x900 | Scrolled to the vis-viva orbital speed check                                                            |
| `build-log.png`                       | `/build-log`                | 1440x900 | Top of page                                                                                             |

When the pages change, recapture from a current build at the same viewports and replace the files
under the same names and formats, so the README links keep working.
