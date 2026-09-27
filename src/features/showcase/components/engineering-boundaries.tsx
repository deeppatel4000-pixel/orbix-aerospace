import { ShowcaseSection } from "@/features/showcase/components/showcase-section";

const boundaries = [
  {
    detail:
      "Calculators and analyses are plain TypeScript with no React imports, so they can be unit tested on their own.",
    title: "Equations stay out of components",
  },
  {
    detail:
      "Most dimensional calculator and analysis inputs and results name their unit in the property, for example altitudeMetres or deltaVMetresPerSecond. These are mostly SI units; angles use degrees, and a few results add hours or minutes. Vehicle records instead store a unit beside each value, such as ft or mi.",
    title: "Units in calculator property names",
  },
  {
    detail:
      "Each calculator checks its inputs first and throws an error for values outside its valid range instead of returning a number it cannot support.",
    title: "Invalid inputs are refused",
  },
  {
    detail:
      "Every model is simplified, for example two-body orbits and a standard atmosphere that covers the troposphere only. Mission reports list their model assumptions and limitations with the results.",
    title: "Assumptions are stated",
  },
  {
    detail:
      "Nothing on the site is live telemetry. Mission presets contain inputs only; results appear when an analysis runs in the Engineering Lab.",
    title: "No live data",
  },
  {
    detail:
      "ORBIX is for learning. Its results must not be used for operational, safety or certification decisions.",
    title: "Educational use only",
  },
] as const;

export function EngineeringBoundaries() {
  return (
    <ShowcaseSection
      id="engineering-boundaries"
      lead="Rules the code follows so that a displayed number can be traced back to the function that produced it."
      title="Engineering boundaries"
    >
      <dl className="grid gap-x-6 gap-y-6 md:grid-cols-2">
        {boundaries.map((boundary) => (
          <div key={boundary.title}>
            <dt className="orbix-h4 text-text-primary">{boundary.title}</dt>
            <dd className="mt-1 max-w-[60ch] text-text-secondary">
              {boundary.detail}
            </dd>
          </div>
        ))}
      </dl>
    </ShowcaseSection>
  );
}
