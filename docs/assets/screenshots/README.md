# ORBIX screenshots

Screenshots of the running application, used in the project [README](../../../README.md). Each one
is an unedited browser capture of a real page. None is a mockup or generated image.

Captured on 1 October 2026 from a local production build (`next build` and `next start`) of the
`redesign/anti-vibe-legal` branch with the v3 design ("Standards manual"), all eight in the fourth
v3 integration pass, with Playwright (Chromium) at a device scale factor of 2 and reduced motion.
Scrollbars were hidden before capture.

All eight files are JPEG (sharp with mozjpeg, quality 82, 4:4:4 chroma), 117 to 408 KB each, under
the 600 KB target.

The set shows the SR-71 photograph twice (home and its own profile). The phone captures of the home
page and the SR-71 profile and the build log capture were replaced by the launch vehicle registry,
the Learn equations and the launch vehicle heights drawn to one scale on a phone.

| File                                  | Page                        | Viewport | State                                                                                                   |
| ------------------------------------- | --------------------------- | -------- | ------------------------------------------------------------------------------------------------------- |
| `home.jpg`                            | `/`                         | 1440x900 | Top of page                                                                                             |
| `aircraft-sr-71.jpg`                  | `/aircraft/sr-71-blackbird` | 1440x900 | Top of page: breadcrumb, title, record figures and the photograph with its caption                      |
| `rockets.jpg`                         | `/rockets`                  | 1440x900 | Top of page: Saturn V split hero with the pictured vehicle's figures                                    |
| `rockets-heights-mobile.jpg`          | `/rockets`                  | 390x844  | Scrolled to "Heights to one scale", the to-scale lineup laid on its side                                |
| `learn-equations.jpg`                 | `/learn`                    | 1440x900 | Scrolled to key idea 1.1: the lift equation (1.1), its variables, then the drag equation (1.2)          |
| `compare-aircraft.jpg`                | `/compare`                  | 1440x900 | SR-71 Blackbird, F-22 Raptor and F-15 Eagle selected, scrolled to the spec sheet table                  |
| `engineering-lab-rocket-equation.jpg` | `/engineering-lab`          | 1440x900 | Rocket equation with 100,000 kg, 40,000 kg and 300 s entered, scrolled to the tool; result 2,695.72 m/s |
| `verification.jpg`                    | `/verification`             | 1440x900 | Scrolled to the vis-viva orbital speed check                                                            |

When the pages change, recapture from a current build at the same viewports and replace the files
under the same names and formats, so the README links keep working.
