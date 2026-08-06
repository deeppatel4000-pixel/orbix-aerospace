# ORBIX Visual Asset Register

ORBIX uses original code-native graphics and generated aerospace environment plates so the public portfolio has a consistent identity without relying on scraped or ambiguously licensed imagery.

| Asset                                | Source                                                                                                | License         | Purpose                                                         |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------- | --------------- | --------------------------------------------------------------- |
| ORBIX orbital mark                   | Original SVG authored for this repository in `src/components/brand/orbix-mark.tsx`                    | Project license | Primary brand mark, navigation identity, loading state          |
| ORBIX application icon               | Original SVG authored for this repository in `src/app/icon.svg`                                       | Project license | Browser tab and installable application identity                |
| Mission array schematic              | Original React/SVG/CSS composition in `src/components/brand/orbix-mission-array.tsx`                  | Project license | Homepage hero visualization                                     |
| Orbital background system            | Original CSS/SVG composition in `src/components/brand/orbix-background.tsx` and `src/app/globals.css` | Project license | Star field, telemetry grid, orbital geometry, atmospheric glow  |
| Engineering visualization schematics | Existing ORBIX code-rendered SVG/CSS visuals                                                          | Project license | Showcase communication of orbit, reentry, and review workspaces |
| Orbital command environment          | Original generated asset, `public/images/environments/orbital-command.webp`                           | Project license | Homepage, showcase, and Mission Control orbital atmosphere      |
| Tactical aircraft environment        | Original generated asset, `public/images/environments/tactical-aircraft.webp`                         | Project license | Aircraft Explorer flight-test environment                       |
| Launch complex environment           | Original generated asset, `public/images/environments/launch-complex.webp`                            | Project license | Rocket Explorer and launch-mission presentation                 |
| Engineering laboratory environment   | Original generated asset, `public/images/environments/engineering-lab.webp`                           | Project license | Engineering Laboratory and reentry research presentation        |

## Asset policy

- No external photographs, stock assets, or scraped imagery are included in this visual identity release.
- Generated environment plates were created specifically for ORBIX with the built-in image-generation tool and optimized locally to 1600×900 WebP files.
- Decorative SVG and CSS geometry is illustrative and never presented as computed mission data.
- Authentic application screenshots belong under `docs/assets/screenshots/`; they are captured from the running application and are not generated placeholders.
- Any future third-party or public-domain asset must be registered here with its source URL, author or agency, license, and exact in-product purpose before use.

Generation details and prompt records are documented in [generated-environments.md](./generated-environments.md).

## Palette reference

- Orbital Black — `#030711`
- Spacecraft Graphite — `#0A111D`
- Cosmic Navy — `#101D31`
- Orbital Cyan — `#49D7FF`
- Plasma Violet — `#9A7CFF`
- Atmospheric Blue — `#4C8DFF`
- Telemetry Green — `#5CE6AA`
- Signal Amber — `#F6BD68`
- Tactical Olive — `#788B62`
- Tactical Amber — `#D9A84E`
- Laboratory Blue — `#74B9FF`
