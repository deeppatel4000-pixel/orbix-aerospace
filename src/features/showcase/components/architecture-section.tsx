import { ShowcaseSection } from "@/features/showcase/components/showcase-section";

interface ArchitectureLayer {
  readonly description: string;
  readonly name: string;
  readonly paths: readonly string[];
}

/**
 * Top to bottom in import order: a layer may import from layers above it and
 * never from a layer below it. React components may import any layer above.
 */
export const ARCHITECTURE_LAYERS: readonly ArchitectureLayer[] = [
  {
    description:
      "Vehicle records, mission presets and material properties as typed constants with SI units.",
    name: "Data",
    paths: [
      "src/features/vehicles/data",
      "src/features/engineering-lab/missions",
      "src/features/engineering-lab/materials",
    ],
  },
  {
    description:
      "Pure functions for one equation each, such as a Hohmann transfer or stagnation-point heating. They validate inputs and return plain objects.",
    name: "Calculators",
    paths: ["src/features/engineering-lab/calculators"],
  },
  {
    description:
      "Compose several calculators into one study, for example a delta-v budget or a vehicle reentry evaluation.",
    name: "Analyses",
    paths: ["src/features/engineering-lab/analysis"],
  },
  {
    description:
      "Collect finished analyses into a mission report with assumptions and limits, exportable as JSON or Markdown.",
    name: "Reports",
    paths: ["src/features/engineering-lab/reports"],
  },
  {
    description:
      "Server Components and a few client components that render forms, tables and diagrams. Engineering equations stay in the layers above.",
    name: "React",
    paths: ["src/app", "src/features/*/components"],
  },
];

const BOX_HEIGHT = 48;
const STEP = 80;
const BOX_WIDTH = 272;
/** x of the rail that carries imports from every upper layer into React. */
const RAIL_X = 300;
const WIDTH = 320;
/** Extra room above the React box for the presentation boundary label. */
const BOUNDARY_GAP = 32;
const LAST = ARCHITECTURE_LAYERS.length - 1;

function layerY(index: number): number {
  return index * STEP + (index === LAST ? BOUNDARY_GAP : 0);
}

/**
 * The layer stack as an SVG. Box names only, so the text stays legible when
 * the drawing shrinks to a phone width; the list beside it carries the detail.
 * Arrows show import direction. The centre arrows join adjacent upper layers;
 * the rail on the right shows that React may import from every one of them.
 */
function ArchitectureDiagram() {
  const reportsBottom = layerY(LAST - 1) + BOX_HEIGHT;
  const boundaryY = reportsBottom + (layerY(LAST) - reportsBottom) / 2 + 8;
  const reactMid = layerY(LAST) + BOX_HEIGHT / 2;
  const height = layerY(LAST) + BOX_HEIGHT + 2;

  return (
    <svg
      aria-labelledby="architecture-diagram-title architecture-diagram-desc"
      className="h-auto w-full"
      role="img"
      viewBox={`-1 -1 ${WIDTH + 2} ${height}`}
    >
      <title id="architecture-diagram-title">ORBIX layer diagram</title>
      <desc id="architecture-diagram-desc">
        Five stacked layers: data, calculators, analyses, reports, then React.
        Arrows show import direction. Downward arrows join data, calculators,
        analyses and reports. A rail on the right connects each of those four
        layers to React, because components may import any of them. A line
        between reports and React marks the presentation boundary.
      </desc>
      <defs>
        <marker
          id="architecture-arrow"
          markerHeight="8"
          markerWidth="8"
          orient="auto"
          refX="7"
          refY="4"
          viewBox="0 0 8 8"
        >
          <path d="M0 0 L8 4 L0 8 Z" fill="var(--orbix-data-axis)" />
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
              width={BOX_WIDTH}
              x="0"
              y={y}
            />
            <text
              dominantBaseline="central"
              fill="var(--orbix-text-primary)"
              fontSize="16"
              fontWeight="600"
              textAnchor="middle"
              x={BOX_WIDTH / 2}
              y={y + BOX_HEIGHT / 2}
            >
              {layer.name}
            </text>
            {index < LAST - 1 ? (
              <line
                markerEnd="url(#architecture-arrow)"
                stroke="var(--orbix-data-axis)"
                strokeWidth="1.5"
                x1={BOX_WIDTH / 2}
                x2={BOX_WIDTH / 2}
                y1={y + BOX_HEIGHT + 4}
                y2={layerY(index + 1) - 4}
              />
            ) : null}
            {isPresentation ? null : (
              <line
                stroke="var(--orbix-data-axis)"
                strokeWidth="1.5"
                x1={BOX_WIDTH}
                x2={RAIL_X}
                y1={y + BOX_HEIGHT / 2}
                y2={y + BOX_HEIGHT / 2}
              />
            )}
          </g>
        );
      })}

      <line
        stroke="var(--orbix-data-axis)"
        strokeWidth="1.5"
        x1={RAIL_X}
        x2={RAIL_X}
        y1={BOX_HEIGHT / 2}
        y2={reactMid}
      />
      <line
        markerEnd="url(#architecture-arrow)"
        stroke="var(--orbix-data-axis)"
        strokeWidth="1.5"
        x1={RAIL_X}
        x2={BOX_WIDTH + 4}
        y1={reactMid}
        y2={reactMid}
      />

      <line
        stroke="var(--orbix-border-strong)"
        strokeWidth="1"
        x1="0"
        x2={RAIL_X - 8}
        y1={boundaryY}
        y2={boundaryY}
      />
      <line
        stroke="var(--orbix-border-strong)"
        strokeWidth="1"
        x1={RAIL_X + 8}
        x2={WIDTH}
        y1={boundaryY}
        y2={boundaryY}
      />
      <text
        fill="var(--orbix-text-muted)"
        fontSize="14"
        textAnchor="start"
        x="0"
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
      first
      id="architecture"
      lead="Each layer imports only from the layers above it, and no layer above React imports React. Components may call calculators, analyses or reports directly."
      title="Architecture"
    >
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-6">
        <figure className="lg:col-span-4">
          <div className="max-w-[22rem]">
            <ArchitectureDiagram />
          </div>
          <figcaption className="orbix-label mt-3 max-w-[22rem]">
            Layer order in the repository. Arrows show import direction only:
            the centre arrows join adjacent layers, and the rail on the right
            shows React importing from any layer above the boundary.
          </figcaption>
        </figure>

        <ol className="divide-y divide-border-subtle border-y border-border-subtle lg:col-span-8">
          {ARCHITECTURE_LAYERS.map((layer) => (
            <li className="py-4" key={layer.name}>
              <h3 className="orbix-h3 text-text-primary">{layer.name}</h3>
              <p className="mt-1 max-w-[68ch] text-text-secondary">
                {layer.description}
              </p>
              <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                {layer.paths.map((path) => (
                  <li key={path}>
                    <code className="orbix-data orbix-data--sm break-all text-text-secondary">
                      {path}
                    </code>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>
    </ShowcaseSection>
  );
}
