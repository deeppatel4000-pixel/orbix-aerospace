# ORBIX screenshots

Screenshots of the running application, used in the project [README](../../../README.md). Each one
is an unedited browser capture of a real page. None is a mockup or generated image.

Captured on 29 September 2026 from a local production build (`next build` and `next start`) of
the `redesign/anti-vibe-legal` branch with the v2 design, with Playwright (Chromium) at a device
scale factor of 2 and reduced motion. Scrollbars were hidden before capture.

`aircraft-sr-71-mobile.png` is a full-colour PNG (colour type 2, 8 bits per channel, 405 KB). The
other seven are indexed PNGs (IHDR colour type 3, bit depth 8) with a 256-entry palette, encoded
with sharp's libimagequant: `png({ palette: true, colours: 256, dither: 0.5, effort: 10,
compressionLevel: 9 })`. In full colour those seven are 0.63 to 0.90 MB for the interface captures
and 3.1 MB (`aircraft-sr-71.png`) and 3.5 MB (`home.png`) for the two photo-heavy desktop captures.
With the palette the five interface captures are 334 to 467 KB, but `aircraft-sr-71.png` is 1.18 MB
and `home.png` is 1.44 MB, over the 600 KB target. The earlier versions met the target only with
22 and 39 colours, which turned the sky and mountains into flat patches, so these two are kept at
256 colours. Whether to accept the size or the posterization is an owner decision.

The two SR-71 profile captures are scrolled so the record figures and the section navigation
sit under the header; at the top of the page the profile shows the same photograph as the home
hero, and the pairs would look almost the same.

| File                                  | Page                        | Viewport | State                                                                                                   |
| ------------------------------------- | --------------------------- | -------- | ------------------------------------------------------------------------------------------------------- |
| `home.png`                            | `/`                         | 1440x900 | Top of page                                                                                             |
| `home-mobile.png`                     | `/`                         | 390x844  | Top of page                                                                                             |
| `aircraft-sr-71.png`                  | `/aircraft/sr-71-blackbird` | 1440x900 | Scrolled so the breadcrumb, title, record figures and section navigation sit under the header           |
| `aircraft-sr-71-mobile.png`           | `/aircraft/sr-71-blackbird` | 390x844  | Scrolled past the photograph to the breadcrumb, title, record figures and section navigation            |
| `compare-aircraft.png`                | `/compare`                  | 1440x900 | SR-71 Blackbird, F-22 Raptor and F-15 Eagle selected, scrolled to the spec sheet                        |
| `engineering-lab-rocket-equation.png` | `/engineering-lab`          | 1440x900 | Rocket equation with 100,000 kg, 40,000 kg and 300 s entered, scrolled to the tool; result 2,695.72 m/s |
| `verification.png`                    | `/verification`             | 1440x900 | Scrolled to the vis-viva orbital speed check                                                            |
| `build-log.png`                       | `/build-log`                | 1440x900 | Top of page                                                                                             |

When the pages change, recapture from a current build at the same viewports and replace the files
under the same names, so the README links keep working.
