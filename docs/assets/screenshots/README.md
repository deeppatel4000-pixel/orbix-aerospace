# ORBIX screenshots

Screenshots of the running application, used in the project [README](../../../README.md). Each one
is an unedited browser capture of a real page. None is a mockup or generated image.

Captured on 1 October 2026 from a local production build (`next build` and `next start`) of the
`redesign/anti-vibe-legal` branch in the v4 integration pass, with Playwright (Chromium) at a device
scale factor of 2 and reduced motion. Scrollbars were hidden before capture.

All eight files are JPEG (sharp with mozjpeg, quality 82, 4:4:4 chroma), 182 to 414 KB each, under
the 600 KB target. All eight were recaptured in the second integration pass.

The v4 home page has no photograph, so no photograph appears twice in the set. The rocket equation
capture was replaced by the mission planner.

| File                                  | Page                        | Viewport | State                                                                                          |
| ------------------------------------- | --------------------------- | -------- | ---------------------------------------------------------------------------------------------- |
| `home.jpg`                            | `/`                         | 1440x900 | Top of page: thesis, lead, actions and the Transfer Explorer                                   |
| `aircraft-sr-71.jpg`                  | `/aircraft/sr-71-blackbird` | 1440x900 | Top of page: breadcrumb, title, record figures and the photograph with its caption             |
| `rockets.jpg`                         | `/rockets`                  | 1440x900 | Top of page: Saturn V split hero with the pictured vehicle's figures                           |
| `rockets-heights-mobile.jpg`          | `/rockets`                  | 390x844  | Scrolled to "Heights to one scale", the to-scale lineup laid on its side                       |
| `learn-equations.jpg`                 | `/learn`                    | 1440x900 | Scrolled to key idea 1.1: the lift equation (1.1), its variables, then the drag equation (1.2) |
| `compare-aircraft.jpg`                | `/compare`                  | 1440x900 | Default comparison (SR-71 Blackbird, F-22 Raptor, B-2 Spirit), scrolled to the spec sheet      |
| `engineering-lab-mission-planner.jpg` | `/engineering-lab`          | 1440x900 | `#mission-planner`, scrolled to the tool with the first preset selected                        |
| `verification.jpg`                    | `/verification`             | 1440x900 | Scrolled to the vis-viva orbital speed check                                                   |

When the pages change, recapture from a current build at the same viewports and replace the files
under the same names and formats, so the README links keep working.
