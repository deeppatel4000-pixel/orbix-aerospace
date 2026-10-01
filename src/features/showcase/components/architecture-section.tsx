import { DiagramPlate } from "@/components/ui/diagram-plate";
import { formatCode } from "@/components/ui/readout";
import { keepCompounds } from "@/features/showcase/components/keep-compounds";
import { LegendSwatch } from "@/features/showcase/components/mission-diagrams";
import { ShowcaseSection } from "@/features/showcase/components/showcase-section";

interface ArchitectureLayer {
  readonly description: string;
  /** The folders, shortened to fit the layer's box in the diagram. */
  readonly folders: string;
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
    folders: "data, missions, materials",
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
    folders: "engineering-lab/calculators",
    name: "Calculators",
    paths: ["src/features/engineering-lab/calculators"],
  },
  {
    description:
      "Compose several calculators, and the material data where needed, into one study, for example a delta-v budget or a vehicle reentry evaluation.",
    folders: "engineering-lab/analysis",
    name: "Analyses",
    paths: ["src/features/engineering-lab/analysis"],
  },
  {
    description:
      "Arrange a finished mission profile analysis, passed in as an argument, into a report with assumptions and limits, exportable as JSON or Markdown. Reports import only shared types.",
    folders: "engineering-lab/reports",
    name: "Reports",
    paths: ["src/features/engineering-lab/reports"],
  },
  {
    description:
      "Server and client components that render forms, tables and diagrams. Engineering equations stay in the layers above.",
    folders: "app, */components",
    name: "React",
    paths: ["src/app", "src/features/*/components"],
  },
];

/** Low, narrow blocks, so the stack reads as a schematic, not as cards. */
const BOX_HEIGHT = 44;
const STEP = 64;
/** Left edge of the blocks; the strip to its left carries the data rail. */
const BOX_X = 24;
const BOX_WIDTH = 196;
const BOX_RIGHT = BOX_X + BOX_WIDTH;
/** x of the rail that carries data imports into Analyses. */
const LEFT_RAIL_X = 8;
/** x of the rail that carries imports from every upper layer into React. */
const RAIL_X = BOX_RIGHT + 24;
const WIDTH = RAIL_X + 16;
/** Room left of the data rail and right of the React rail for their labels. */
const LABEL_ROOM = 16;
/**
 * Rail labels, in user units. The drawing is 278 units wide: at its 24rem
 * maximum it draws at about 1.4px a unit, so 8 units is about 11px. Below
 * 40rem it can shrink to 288px at a 320px viewport (about 1px a unit), so
 * 11 units keeps it at about 11px there.
 */
const RAIL_LABEL = "text-[8px] max-sm:text-[11px]";
/** Extra room above the React box for the presentation boundary label. */
const BOUNDARY_GAP = 32;
const LAST = ARCHITECTURE_LAYERS.length - 1;
const DATA = 0;
const CALCULATORS = 1;
const ANALYSES = 2;
/** Linework (spec 8): ink-muted strokes on the page ground, no fills. */
const STROKE = "var(--orbix-data-axis)";
/** Import edges draw at 1.5px and carry the drawing. */
const HEAVY = "1.5";
/** Layer outlines and the dashed presentation boundary draw at 0.75px. */
const LIGHT = "0.75";

function layerY(index: number): number {
  return index * STEP + (index === LAST ? BOUNDARY_GAP : 0);
}

function layerMid(index: number): number {
  return layerY(index) + BOX_HEIGHT / 2;
}

/**
 * The layer stack as a line drawing on the page ground: thin
 * square-cornered outlines with no fill, heavier import edges and one
 * dashed boundary. Each
 * outline names its layer and, from 40rem, its
 * folders on a second line in the data face; below 40rem the names only,
 * so the text stays legible at a phone width. The list below carries the
 * full paths.
 * React is set apart by the dashed presentation boundary above it, not by
 * colour. Every arrow is a real import edge, pointing from the imported layer to the
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
              fill="none"
              height={BOX_HEIGHT}
              stroke={STROKE}
              strokeWidth={LIGHT}
              vectorEffect="non-scaling-stroke"
              width={BOX_WIDTH}
              x={BOX_X}
              y={y}
            />
            {/* 12 units draw at about 17px at 24rem; below 40rem 14 units
                keep about 14px at a 320px viewport, and the name is
                centred in the block without the folder line. */}
            <text
              className="text-[12px] max-sm:hidden"
              dominantBaseline="central"
              fill="var(--orbix-text-primary)"
              fontFamily="var(--font-interface)"
              fontWeight="600"
              textAnchor="middle"
              x={BOX_X + BOX_WIDTH / 2}
              y={y + BOX_HEIGHT / 2 - 7}
            >
              {layer.name}
            </text>
            <text
              className="text-[14px] sm:hidden"
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
            {/* 8 units draw at about 11px at 24rem. */}
            <text
              aria-hidden="true"
              className="text-[8px] max-sm:hidden"
              dominantBaseline="central"
              fill="var(--orbix-text-muted)"
              fontFamily="var(--font-telemetry)"
              textAnchor="middle"
              x={BOX_X + BOX_WIDTH / 2}
              y={y + BOX_HEIGHT / 2 + 9}
            >
              {layer.folders}
            </text>
            {isPresentation ? null : (
              <line
                stroke={STROKE}
                strokeWidth={HEAVY}
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
        strokeWidth={HEAVY}
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
        strokeWidth={HEAVY}
        vectorEffect="non-scaling-stroke"
      />

      {/* Every upper layer into React, down the right rail. */}
      <line
        stroke={STROKE}
        strokeWidth={HEAVY}
        vectorEffect="non-scaling-stroke"
        x1={RAIL_X}
        x2={RAIL_X}
        y1={layerMid(DATA)}
        y2={reactMid}
      />
      <line
        markerEnd="url(#architecture-arrow)"
        stroke={STROKE}
        strokeWidth={HEAVY}
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
        fontFamily="var(--font-interface)"
        textAnchor="middle"
        transform={`translate(${LEFT_RAIL_X - 5} ${dataRailMid}) rotate(-90)`}
      >
        data into analyses
      </text>
      <text
        className={RAIL_LABEL}
        dominantBaseline="text-before-edge"
        fill="var(--orbix-text-muted)"
        fontFamily="var(--font-interface)"
        textAnchor="middle"
        transform={`translate(${RAIL_X + 5} ${reactRailMid}) rotate(-90)`}
      >
        imports into React
      </text>

      <line
        stroke={STROKE}
        strokeDasharray="4 3"
        strokeWidth={LIGHT}
        vectorEffect="non-scaling-stroke"
        x1={BOX_X}
        x2={RAIL_X}
        y1={boundaryY}
        y2={boundaryY}
      />
      <text
        className="text-[9px] max-sm:text-[11px]"
        fill="var(--orbix-text-muted)"
        fontFamily="var(--font-interface)"
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
      id="architecture"
      lead="Each layer imports only from layers above it or from shared types and helpers, and no layer above React imports React. Components import data, calculators, analyses and reports directly."
      title="Architecture"
    >
      {/* The page's first figure: the drawing up to 24rem from the column
          edge; from 64rem its key stands in a column to its right, and the
          caption runs under both from the same left edge. */}
      <DiagramPlate aria-labelledby="architecture-figure-caption">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,24rem)_minmax(0,20rem)] lg:items-end lg:gap-12">
          <div className="w-full max-w-[24rem] py-2">
            <ArchitectureDiagram />
          </div>
          <ul
            aria-label="Diagram key"
            className="grid gap-3 text-sm text-text-secondary"
          >
            <li className="flex items-start gap-2">
              <LegendSwatch outline stroke={STROKE} width={0.75} />
              <span>An outline is a layer.</span>
            </li>
            <li className="flex items-start gap-2">
              <LegendSwatch arrow stroke={STROKE} width={1.5} />
              <span>
                An arrow is an import edge, from the imported layer to the
                importing one.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <LegendSwatch dash="4 3" stroke={STROKE} width={1} />
              <span>
                The dashed line is the presentation boundary, with React below
                it.
              </span>
            </li>
          </ul>
        </div>
        <figcaption
          className="orbix-caption mt-6"
          id="architecture-figure-caption"
        >
          <span className="orbix-caption__number">Fig. 1</span> Layer order in
          the repository. Analyses import calculators and data, calculators and
          reports import no other layer, and the rail on the right shows React
          importing from every layer above the boundary.
        </figcaption>
      </DiagramPlate>
      {/* Each layer once: its name and source folders, then what it holds. */}
      <dl className="mt-12">
        {ARCHITECTURE_LAYERS.map((layer) => (
          <div
            className="grid items-baseline gap-3 border-t border-border-subtle py-6 first:border-t-0 first:pt-0 last:pb-0 md:grid-cols-[minmax(0,22rem)_minmax(0,40rem)] md:gap-10"
            key={layer.name}
          >
            <dt>
              <span className="orbix-h3 block text-text-primary">
                {layer.name}
              </span>
              <span className="mt-2 grid gap-1">
                {layer.paths.map((path) => (
                  <code
                    className="orbix-data orbix-data--sm block bg-transparent! p-0! text-[length:var(--text-label)]! break-words text-text-secondary"
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
