# ORBIX screenshot capture system

This directory is a tracked capture plan for authentic screenshots from a verified ORBIX build. It
contains documentation only until real application captures are added. Do not add generated mockups,
placeholder images, or artwork that could be mistaken for working product functionality.

## Directory map

```text
screenshots/
├── mission-control/
├── orbital-analysis/
├── reentry-analysis/
├── mission-replay/
├── trade-study/
└── showcase/
```

Each folder README defines the required scene, recommended mission, capture state, resolution, and
portfolio purpose. The planned primary files are:

| Portfolio story                                | Planned authentic capture                      |
| ---------------------------------------------- | ---------------------------------------------- |
| Complete command-center experience             | `mission-control/mission-control-overview.png` |
| Orbital transfer communication                 | `orbital-analysis/orbit-workspace.png`         |
| Entry, deceleration, and thermal communication | `reentry-analysis/reentry-workspace.png`       |
| Presentation-only mission sequencing           | `mission-replay/mission-replay.png`            |
| Side-by-side architecture review               | `trade-study/trade-study.png`                  |
| Cinematic mission presentation                 | `showcase/mission-showcase.png`                |
| Guided platform walkthrough                    | `showcase/demo-mode.png`                       |

## Shared capture standard

- Capture the deployed application or a production build after `npm run validate` passes.
- Use a 1440 × 900 browser viewport for primary desktop images. Capture an additional 390 × 844
  mobile view only when it communicates a responsive behavior.
- Use ORBIX's default dark interface and a representative educational preset.
- Prefer the dedicated `/showcase-capture/[mission-id]` routes for clean preset summary captures.
- Hide browser chrome, development overlays, console windows, extensions, and personal information.
- Export lossless PNG files and optimize them without changing visible content.
- Record the source commit and deployed URL in the pull request or commit that adds each capture.
- Add specific alt text wherever an image is embedded in Markdown.

The capture route is a presentation surface. It exposes existing preset information and never
generates replacement engineering outputs.
