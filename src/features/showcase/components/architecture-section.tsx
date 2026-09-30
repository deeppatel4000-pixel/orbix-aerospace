import { DiagramPlate } from "@/components/ui/diagram-plate";
import { formatCode } from "@/components/ui/readout";
import { keepCompounds } from "@/features/showcase/components/keep-compounds";
import { LegendSwatch } from "@/features/showcase/components/mission-diagrams";
import { ShowcaseSection } from "@/features/showcase/components/showcase-section";

interface ArchitectureLayer {
  readonly description: string;
  readonly name: string;
  readonly paths: readonly string[];
}

/**
 * Top to bottom in import order: a layer imports only from layers above it
 * (or from the shared types and helpers) and never from a layer below it.
 * Not every layer imports the one directly above; the diagram draws the real
 * edges.
 */
export const ARCHITECTURE_LAYERS: readonly ArchitectureLayer[] = [
  {
    description:
      "Vehicle records store each value with its own unit, such as ft, mi or Mach. Mission presets and material properties are typed constants whose property names state their units, for example initialAltitudeMetres.",
    name: "Data",
    paths: [
      "src/features/vehicles/data",
      "src/features/engineering-lab/missions",
      "src/features/engineering-lab/materials",
    ],
  },
  {
    description:
      "Pure functions for one equation each, such as a Hohmann transfer or stagnation-point heating. They validate inputs, return plain objects and import only shared types, helpers and other calculators.",
    name: "Calculators",
    paths: ["src/features/engineering-lab/calculators"],
  },
  {
    description:
      "Compose several calculators, and the material data where needed, into one study, for example a delta-v budget or a vehicle reentry evaluation.",
    name: "Analyses",
    paths: ["src/features/engineering-lab/analysis"],
  },
  {
    description:
      "Arrange a finished mission profile analysis, passed in as an argument, into a report with assumptions and limits, exportable as JSON or Markdown. Reports import only shared types.",
    name: "Reports",
    paths: ["src/features/engineering-lab/reports"],
  },
  {
    description:
      "Server and client components that render forms, tables and diagrams. Engineering equations stay in the layers above.",
    name: "React",
    paths: ["src/app", "src/features/*/components"],
  },
];

const BOX_HEIGHT = 48;
const STEP = 80;
/** Left edge of the boxes; the strip to its left carries the data rail. */
const BOX_X = 24;
const BOX_WIDTH = 256;
const BOX_RIGHT = BOX_X + BOX_WIDTH;
/** x of the rail that carries data imports into Analyses. */
const LEFT_RAIL_X = 8;
/** x of the rail that carries imports from every upper layer into React. */
const RAIL_X = 304;
const WIDTH = 320;
/** Room left of the data rail and right of the React rail for their labels. */
const LABEL_ROOM = 16;
/**
 * Rail labels, in user units. The drawing is 342 units wide: at 34rem it
 * draws at about 1.6px a unit, so 7.5 units is about 12px. Below 40rem it
 * can shrink to about 246px at a 320px viewport (0.72px a unit), so 15.5
 * units keeps it at about 11px there.
 */
const RAIL_LABEL = "text-[7.5px] max-sm:text-[15.5px]";
/** Extra room above the React box for the presentation boundary label. */
const BOUNDARY_GAP = 32;
const LAST = ARCHITECTURE_LAYERS.length - 1;
const DATA = 0;
const CALCULATORS = 1;
const ANALYSES = 2;
const STROKE = "var(--orbix-data-axis)";

function layerY(index: number): number {
  return index * STEP + (index === LAST ? BOUNDARY_GAP : 0);
}

function layerMid(index: number): number {
  return layerY(index) + BOX_HEIGHT / 2;
}

/**
 * The layer stack as an SVG. Box names only, so the text stays legible when
 * the drawing shrinks to a phone width; the list below carries the detail.
 * Every arrow is a real import edge, pointing from the imported layer to the
 * importing one: Calculators into Analyses, Data into Analyses (left rail),
 * and every upper layer into React (right rail). Calculators import no other
 * layer, and Reports import only shared types.
 */
function ArchitectureDiagram() {
  const dataRailMid = (layerMid(DATA) + layerMid(ANALYSES)) / 2;
  const reactRailMid = (layerMid(DATA) + layerMid(LAST - 1)) / 2;
  const reportsBottom = layerY(LAST - 1) + BOX_HEIGHT;
  const boundaryY = reportsBottom + (layerY(LAST) - reportsBottom) / 2 + 8;
  const reactMid = layerMid(LAST);
  const height = layerY(LAST) + BOX_HEIGHT + 2;
  const dataRail = [
    `${BOX_X},${layerMid(DATA)}`,
    `${LEFT_RAIL_X},${layerMid(DATA)}`,
    `${LEFT_RAIL_X},${layerMid(ANALYSES)}`,
    `${BOX_X - 4},${layerMid(ANALYSES)}`,
  ].join(" ");

  return (
    <svg
      aria-labelledby="architecture-diagram-title architecture-diagram-desc"
      className="h-auto w-full"
      role="img"
      viewBox={`${-1 - LABEL_ROOM} -1 ${WIDTH + 6 + LABEL_ROOM} ${height}`}
    >
      <title id="architecture-diagram-title">ORBIX layer diagram</title>
      <desc id="architecture-diagram-desc">
        Five stacked layers: data, calculators, analyses, reports, then React.
        Arrows point from the imported layer to the importing one. Analyses
        import calculators and data. Calculators and reports import no other
        layer, only shared types and helpers. A rail on the right connects all
        four upper layers to React, because components may import any of them. A
        line between reports and React marks the presentation boundary.
      </desc>
      <defs>
        {/* Sized in user units so the head stays about 10px when drawn. */}
        <marker
          id="architecture-arrow"
          markerHeight="6"
          markerUnits="userSpaceOnUse"
          markerWidth="6"
          orient="auto"
          refX="7"
          refY="4"
          viewBox="0 0 8 8"
        >
          <path d="M0 0 L8 4 L0 8 Z" fill={STROKE} />
        </marker>
      </defs>

      {ARCHITECTURE_LAYERS.map((layer, index) => {
        const y = layerY(index);
        const isPresentation = index === LAST;

        return (
          <g key={layer.name}>
            <rect
              fill="var(--orbix-surface-raised)"
              height={BOX_HEIGHT}
              rx="4"
              stroke={
                isPresentation
                  ? "var(--orbix-accent)"
                  : "var(--orbix-border-control)"
              }
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
              width={BOX_WIDTH}
              x={BOX_X}
              y={y}
            />
            {/* 12 units draw at about 19px at 34rem; below 40rem 16 units
                keep about 11.5px at a 320px viewport. */}
            <text
              className="text-[12px] max-sm:text-[16px]"
              dominantBaseline="central"
              fill="var(--orbix-text-primary)"
              fontFamily="var(--font-interface)"
              fontWeight="600"
              textAnchor="middle"
              x={BOX_X + BOX_WIDTH / 2}
              y={y + BOX_HEIGHT / 2}
            >
              {layer.name}
            </text>
            {isPresentation ? null : (
              <line
                stroke={STROKE}
                strokeWidth="1.25"
                vectorEffect="non-scaling-stroke"
                x1={BOX_RIGHT}
                x2={RAIL_X}
                y1={y + BOX_HEIGHT / 2}
                y2={y + BOX_HEIGHT / 2}
              />
            )}
          </g>
        );
      })}

      {/* Calculators into Analyses. */}
      <line
        markerEnd="url(#architecture-arrow)"
        stroke={STROKE}
        strokeWidth="1.25"
        vectorEffect="non-scaling-stroke"
        x1={BOX_X + BOX_WIDTH / 2}
        x2={BOX_X + BOX_WIDTH / 2}
        y1={layerY(CALCULATORS) + BOX_HEIGHT + 4}
        y2={layerY(ANALYSES) - 4}
      />

      {/* Data into Analyses, down the left rail. */}
      <polyline
        fill="none"
        markerEnd="url(#architecture-arrow)"
        points={dataRail}
        stroke={STROKE}
        strokeWidth="1.25"
        vectorEffect="non-scaling-stroke"
      />

      {/* Every upper layer into React, down the right rail. */}
      <line
        stroke={STROKE}
        strokeWidth="1.25"
        vectorEffect="non-scaling-stroke"
        x1={RAIL_X}
        x2={RAIL_X}
        y1={layerMid(DATA)}
        y2={reactMid}
      />
      <line
        markerEnd="url(#architecture-arrow)"
        stroke={STROKE}
        strokeWidth="1.25"
        vectorEffect="non-scaling-stroke"
        x1={RAIL_X}
        x2={BOX_RIGHT + 4}
        y1={reactMid}
        y2={reactMid}
      />

      {/* Rail labels, set along each rail and read from the bottom up. */}
      <text
        className={RAIL_LABEL}
        fill="var(--orbix-text-muted)"
        fontFamily="var(--font-telemetry)"
        textAnchor="middle"
        transform={`translate(${LEFT_RAIL_X - 5} ${dataRailMid}) rotate(-90)`}
      >
        data into analyses
      </text>
      <text
        className={RAIL_LABEL}
        dominantBaseline="text-before-edge"
        fill="var(--orbix-text-muted)"
        fontFamily="var(--font-telemetry)"
        textAnchor="middle"
        transform={`translate(${RAIL_X + 5} ${reactRailMid}) rotate(-90)`}
      >
        imports into React
      </text>

      <line
        stroke="var(--orbix-border-strong)"
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
        x1={BOX_X}
        x2={RAIL_X - 8}
        y1={boundaryY}
        y2={boundaryY}
      />
      <text
        className="text-[9px] uppercase max-sm:text-[15.5px]"
        fill="var(--orbix-text-muted)"
        fontFamily="var(--font-telemetry)"
        letterSpacing="0.12em"
        textAnchor="start"
        x={BOX_X}
        y={boundaryY - 8}
      >
        Presentation boundary
      </text>
    </svg>
  );
}

export function ArchitectureSection() {
  return (
    <ShowcaseSection
      // The hero has no bottom padding from 1024px; this sets the gap.
      className="lg:pt-16"
      id="architecture"
      lead="Each layer imports only from layers above it or from shared types and helpers, and no layer above React imports React. Components import data, calculators, analyses and reports directly."
      number={1}
      title="Architecture"
    >
      {/* The page's hero figure: the drawing up to 34rem, then its key and
          caption, level with the Data box from 1024px. */}
      <DiagramPlate
        aria-labelledby="architecture-figure-title architecture-figure-caption"
        className="grid gap-y-4 lg:grid-cols-[minmax(0,34rem)_minmax(0,1fr)] lg:grid-rows-[auto_1fr] lg:items-start lg:gap-x-16"
      >
        <div className="mb-6 w-full max-w-[34rem] justify-self-center py-2 lg:row-span-2 lg:mb-0 lg:justify-self-start">
          <ArchitectureDiagram />
        </div>
        <div className="max-w-[40ch] lg:pt-2">
          <p
            className="orbix-caps text-text-muted"
            id="architecture-figure-title"
          >
            Layer order in the repository
          </p>
          <ul
            aria-label="Diagram key"
            className="mt-4 grid gap-2 border-t border-border-subtle pt-4 text-sm text-text-secondary"
          >
            <li className="flex items-start gap-2">
              <LegendSwatch
                fill="var(--orbix-surface-raised)"
                stroke="var(--orbix-border-control)"
              />
              <span>A box is a layer.</span>
            </li>
            <li className="flex items-start gap-2">
              <LegendSwatch arrow stroke={STROKE} width={1.25} />
              <span>
                An arrow is an import edge, from the imported layer to the
                importing one.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <LegendSwatch
                fill="var(--orbix-surface-raised)"
                stroke="var(--orbix-accent)"
              />
              <span>
                The accent outline marks React, below the presentation boundary.
              </span>
            </li>
          </ul>
        </div>
        <figcaption
          className="max-w-[40ch] border-t border-border-subtle pt-4 text-sm leading-relaxed text-text-secondary lg:col-start-2 lg:mt-8 lg:self-start"
          id="architecture-figure-caption"
        >
          Analyses import calculators and data, calculators and reports import
          no other layer, and the rail on the right shows React importing from
          every layer above the boundary.
        </figcaption>
      </DiagramPlate>

      {/* Each layer once: its name and source folders, then what it holds. */}
      <dl className="mt-12 border-t border-border-subtle">
        {ARCHITECTURE_LAYERS.map((layer) => (
          <div
            className="grid gap-3 border-b border-border-subtle py-6 last:border-b-0 last:pb-0 md:grid-cols-[minmax(0,20rem)_minmax(0,40rem)] md:gap-10"
            key={layer.name}
          >
            <dt>
              <span className="orbix-h3 block text-text-primary">
                {layer.name}
              </span>
              <span className="mt-2 grid gap-1">
                {layer.paths.map((path) => (
                  <code
                    className="orbix-data orbix-data--sm block break-words text-text-secondary"
                    key={path}
                  >
                    {formatCode(path)}
                  </code>
                ))}
              </span>
            </dt>
            <dd className="orbix-prose">{keepCompounds(layer.description)}</dd>
          </div>
        ))}
      </dl>
    </ShowcaseSection>
  );
}
