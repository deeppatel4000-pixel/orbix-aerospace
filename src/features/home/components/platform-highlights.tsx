import { Braces, Eye, Layers3, ScanLine, ShieldCheck } from "lucide-react";

import { Container } from "@/components/layout/container";

const architectureSteps = [
  {
    description: "Typed vehicle and mission configurations define the study",
    icon: Braces,
    label: "Inputs",
  },
  {
    description:
      "Pure TypeScript equations keep physics independently testable",
    icon: ScanLine,
    label: "Calculators",
  },
  {
    description: "Composable workflows connect existing engineering outputs",
    icon: Layers3,
    label: "Analysis",
  },
  {
    description:
      "Reports, review, and visualization communicate completed work",
    icon: Eye,
    label: "Presentation",
  },
] as const;

export function PlatformHighlights() {
  return (
    <section
      aria-labelledby="platform-highlights-title"
      className="relative border-b border-border bg-background py-20 sm:py-24"
    >
      <Container>
        <div className="grid gap-10 lg:grid-cols-[minmax(18rem,0.55fr)_minmax(0,1.45fr)] lg:gap-16">
          <div>
            <p className="orbix-kicker">Engineering architecture</p>
            <h2
              className="font-display mt-4 text-4xl leading-none font-semibold tracking-[-0.045em] sm:text-5xl"
              id="platform-highlights-title"
            >
              One responsibility per layer. One traceable result.
            </h2>
            <p className="mt-5 text-base leading-7 text-muted">
              Typed inputs move through isolated calculators and composable
              analyses before React presents the result for inspection and
              review.
            </p>
            <div className="mt-8 flex items-start gap-3 border-l border-telemetry/50 pl-4">
              <ShieldCheck
                aria-hidden="true"
                className="mt-0.5 shrink-0 text-telemetry"
                size={18}
              />
              <p className="text-sm leading-6 text-muted">
                Physics remains independent from React. Analysis modules
                orchestrate existing equations, while presentation components
                receive completed outputs.
              </p>
            </div>
          </div>

          <ol className="grid gap-px overflow-hidden border border-border bg-border md:grid-cols-2">
            {architectureSteps.map((step, index) => (
              <li className="bg-surface p-6 sm:p-7" key={step.label}>
                <div className="flex items-center justify-between gap-4">
                  <step.icon
                    aria-hidden="true"
                    className="text-accent"
                    size={21}
                    strokeWidth={1.6}
                  />
                  <span className="font-mono text-[0.6rem] tracking-[0.14em] text-muted uppercase">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="mt-8 text-lg font-semibold">{step.label}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}
