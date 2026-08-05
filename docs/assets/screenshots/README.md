# ORBIX screenshot requirements

This directory is reserved for authentic screenshots captured from a verified ORBIX build. The
portfolio README currently uses text placeholders so it never implies that generated artwork or a
mockup is working application functionality.

## Required captures

| File                            | Required view            | What the screenshot should communicate                                          |
| ------------------------------- | ------------------------ | ------------------------------------------------------------------------------- |
| `mission-control-dashboard.png` | Mission Control overview | Workspace navigation, status, telemetry, and professional command-center layout |
| `orbital-visualization.png`     | Orbit workspace          | Transfer path, orbit context, and supplied orbital-analysis outputs             |
| `reentry-visualization.png`     | Reentry workspace        | Trajectory profile, heating and deceleration markers, and engineering context   |
| `mission-showcase.png`          | Showcase workspace       | Presentation sequence, phase navigation, and mission telemetry                  |
| `trade-study.png`               | Trade Study workspace    | Side-by-side mission architecture comparison without winner scoring             |
| `demo-mode.png`                 | Demo Mode workspace      | Guided educational flow and platform orientation                                |

## Capture guidelines

- Capture the real application at a consistent desktop viewport, preferably 1440 × 900.
- Use ORBIX's default dark mission-control theme.
- Use a representative educational preset and avoid personal or account information.
- Do not include browser chrome, local filesystem paths, development overlays, or console windows.
- Prefer lossless PNG files and keep each image reasonably optimized for GitHub rendering.
- Add descriptive alt text when replacing a README placeholder with an image.
- Run `npm run validate` before recording the state represented by a screenshot.

Do not add AI-generated interfaces, reconstructed mockups, or images that could be mistaken for
working ORBIX functionality.
