import { DiagramPlate } from "@/components/ui/diagram-plate";

/**
 * The layer figure of the build log's "How it is organized" section, moved
 * from the removed `/showcase` page (v4 plan section 3). The drawing is
 * unchanged; the per-layer description list stayed behind, because the
 * section's short paragraph names the layers instead (build log budget,
 * plan section 8).
 */

interface ArchitectureLayer {
  /** The folders, shortened to fit the layer's box in the diagram. */
  readonly folders: string;
  readonly name: string;
}

/**
 * Top to bottom in import order: a layer imports only from layers above it
 * (or from the shared types and helpers) and never from a layer below it.
 * Not every layer imports the one directly above; the diagram draws the real
 * edges. Folders: `src/features/vehicles/data`, the `missions`,
 * `materials`, `calculators` and `analysis` folders of
 * `src/features/engineering-lab`, then `src/app` and each feature's
 * `components` folder.
 */
const ARCHITECTURE_LAYERS: readonly ArchitectureLayer[] = [
  { folders: "data, missions, materials", name: "Data" },
  { folders: "engineering-lab/calculators", name: "Calculators" },
  { folders: "engineering-lab/analysis", name: "Analyses" },
  { folders: "app, */components", name: "React" },
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
 * Small labels, in user units. The drawing is 282 units wide: at its 24rem
 * maximum it draws at about 1.36px a unit, so 10 units is about 13.6px.
 * Below 40rem it can shrink to 288px at a 320px viewport (about 1px a
 * unit), so 13 units keeps it at 13px there (v4 plan section 5 minimum).
 */
const SMALL_LABEL = "text-[10px] max-sm:text-[13px]";
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
 * color. Every arrow is a real import edge, pointing from the imported layer to the
 * importing one: Calculators into Analyses, Data into Analyses (left rail),
 * and every upper layer into React (right rail). Calculators import no other
 * layer.
 */
function ArchitectureDiagram() {
  const dataRailMid = (layerMid(DATA) + layerMid(ANALYSES)) / 2;
  const reactRailMid = (layerMid(DATA) + layerMid(LAST - 1)) / 2;
  const aboveBottom = layerY(LAST - 1) + BOX_HEIGHT;
  const boundaryY = aboveBottom + (layerY(LAST) - aboveBottom) / 2 + 8;
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
        Four stacked layers: data, calculators, analyses, then React. Arrows
        point from the imported layer to the importing one. Analyses import
        calculators and data. Calculators import no other layer, only shared
        types and helpers. A rail on the right connects all three upper layers
        to React, because components may import any of them. A line between
        analyses and React marks the presentation boundary.
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
                centered in the block without the folder line. */}
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
            {/* 10 units draw at about 13.6px at 24rem. */}
            <text
              aria-hidden="true"
              className="text-[10px] max-sm:hidden"
              dominantBaseline="central"
              fill="var(--orbix-text-muted)"
              fontFamily="var(--font-telemetry)"
              textAnchor="middle"
              x={BOX_X + BOX_WIDTH / 2}
              y={y + BOX_HEIGHT / 2 + 10}
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
        className={SMALL_LABEL}
        fill="var(--orbix-text-muted)"
        fontFamily="var(--font-interface)"
        textAnchor="middle"
        transform={`translate(${LEFT_RAIL_X - 5} ${dataRailMid}) rotate(-90)`}
      >
        data into analyses
      </text>
      <text
        className={SMALL_LABEL}
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
        className={SMALL_LABEL}
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

/** A key swatch: a layer outline, an import arrow or the dashed boundary. */
function KeySwatch({ kind }: { readonly kind: "arrow" | "dash" | "outline" }) {
  return (
    <svg
      aria-hidden="true"
      className="mt-[calc(0.5lh-0.25rem)] h-2 w-6 shrink-0"
      viewBox="0 0 24 8"
    >
      {kind === "outline" ? (
        <rect
          fill="none"
          height="6.5"
          stroke={STROKE}
          strokeWidth="0.75"
          width="22.5"
          x="0.75"
          y="0.75"
        />
      ) : kind === "arrow" ? (
        <>
          <line
            stroke={STROKE}
            strokeWidth="1.5"
            x1="0"
            x2="18"
            y1="4"
            y2="4"
          />
          <path d="M17 0.5 L24 4 L17 7.5 Z" fill={STROKE} />
        </>
      ) : (
        <line
          stroke={STROKE}
          strokeDasharray="4 3"
          strokeWidth="1"
          x1="0"
          x2="24"
          y1="4"
          y2="4"
        />
      )}
    </svg>
  );
}

/**
 * The drawing up to 24rem wide; from 64rem its key stands in a column to
 * its right, and the caption runs under both from the same left edge.
 */
export function ArchitectureFigure() {
  return (
    <DiagramPlate aria-labelledby="architecture-figure-caption">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,24rem)_minmax(0,16rem)] lg:items-end lg:gap-12">
        <div className="w-full max-w-[24rem] py-2">
          <ArchitectureDiagram />
        </div>
        <ul
          aria-label="Diagram key"
          className="m-0! grid list-none! gap-3 p-0! text-sm text-text-secondary"
        >
          <li className="mt-0! flex items-start gap-2">
            <KeySwatch kind="outline" />
            <span>An outline is a layer.</span>
          </li>
          <li className="mt-0! flex items-start gap-2">
            <KeySwatch kind="arrow" />
            <span>
              An arrow is an import, from the imported layer to the importing
              one.
            </span>
          </li>
          <li className="mt-0! flex items-start gap-2">
            <KeySwatch kind="dash" />
            <span>
              The dashed line is the presentation boundary, with React below it.
            </span>
          </li>
        </ul>
      </div>
      <figcaption
        className="orbix-caption mt-6"
        id="architecture-figure-caption"
      >
        <span className="orbix-caption__number">Fig. 1</span> Layer order in the
        repository. Analyses import calculators and data, calculators import no
        other layer, and the rail on the right shows React importing from every
        layer above the boundary.
      </figcaption>
    </DiagramPlate>
  );
}
