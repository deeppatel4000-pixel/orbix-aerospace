# ORBIX screenshots

Screenshots of the running application, used in the project [README](../../../README.md). Each one
is an unedited browser capture of a real page. None is a mockup or generated image.

Captured on 1 October 2026 from a local production build (`next build` and `next start`) of the
`redesign/anti-vibe-legal` branch with the v3 design ("Standards manual"), all eight
recaptured in the second v3 integration pass, with Playwright (Chromium) at a device scale factor of 2 and reduced motion.
Scrollbars were hidden before capture.

All eight files are JPEG (sharp with mozjpeg, quality 82, 4:4:4 chroma), 117 to 418 KB each, under
the 600 KB target.

On the desktop SR-71 profile the photograph is a hard-edged plate on the right of the text, with
its caption under it on the ground. At phone width the photograph follows the text, so the phone
capture shows the title and record figures with the top of the photograph below them.

| File                                  | Page                        | Viewport | State                                                                                                   |
| ------------------------------------- | --------------------------- | -------- | ------------------------------------------------------------------------------------------------------- |
| `home.jpg`                            | `/`                         | 1440x900 | Top of page                                                                                             |
| `home-mobile.jpg`                     | `/`                         | 390x844  | Top of page                                                                                             |
| `aircraft-sr-71.jpg`                  | `/aircraft/sr-71-blackbird` | 1440x900 | Top of page: breadcrumb, title, record figures and the photograph with its caption                      |
| `aircraft-sr-71-mobile.jpg`           | `/aircraft/sr-71-blackbird` | 390x844  | Top of page: breadcrumb, title, record figures, then the top of the photograph                          |
| `compare-aircraft.jpg`                | `/compare`                  | 1440x900 | SR-71 Blackbird, F-22 Raptor and F-15 Eagle selected, scrolled to the spec sheet table                  |
| `engineering-lab-rocket-equation.jpg` | `/engineering-lab`          | 1440x900 | Rocket equation with 100,000 kg, 40,000 kg and 300 s entered, scrolled to the tool; result 2,695.72 m/s |
| `verification.jpg`                    | `/verification`             | 1440x900 | Scrolled to the vis-viva orbital speed check                                                            |
| `build-log.jpg`                       | `/build-log`                | 1440x900 | Top of page                                                                                             |

When the pages change, recapture from a current build at the same viewports and replace the files
under the same names and formats, so the README links keep working.
