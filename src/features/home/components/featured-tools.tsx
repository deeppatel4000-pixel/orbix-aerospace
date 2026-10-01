import Link from "next/link";
import type { ReactNode } from "react";

import { Container } from "@/components/layout/container";
import { ButtonArrowIcon } from "@/components/ui/button-arrow";

interface FeaturedTool {
  /** Engineering Lab deep link: the tool's DOM id. */
  readonly anchor: string;
  /** The tool's main relation, as the lab prints it. */
  readonly equation: ReactNode;
  /** Read in place of the equation markup. */
  readonly equationLabel: string;
  readonly title: string;
}

/**
 * Three Engineering Lab tools (v4 plan section 4.3): one each from
 * propulsion, compressible flow and orbital mechanics, the three areas the
 * Verification page checks. Titles follow the lab's own module text; the
 * equations are the ones each tool prints, written with round brackets
 * only, because the data face draws them close to square ones.
 */
const TOOLS: readonly FeaturedTool[] = [
  {
    anchor: "rocket-equation",
    equation: (
      <>
        Δv = I<sub>sp</sub> g<sub>0</sub> ln(m<sub>0</sub>/m<sub>f</sub>)
      </>
    ),
    equationLabel:
      "Delta v equals I s p times g zero times the natural log of m zero over m f.",
    title: "Tsiolkovsky rocket equation",
  },
  {
    anchor: "shock-condition-analyzer",
    equation: (
      <>
        <span className="whitespace-nowrap">
          M<sub>2</sub>
          <sup>2</sup> = ((γ−1)M<sub>1</sub>
          <sup>2</sup> + 2)
        </span>{" "}
        <span className="whitespace-nowrap">
          / (2γM<sub>1</sub>
          <sup>2</sup> − (γ−1))
        </span>
      </>
    ),
    equationLabel:
      "M 2 squared equals gamma minus 1 times M 1 squared, plus 2, over 2 gamma M 1 squared minus gamma minus 1.",
    title: "Normal shock",
  },
  {
    anchor: "hohmann-transfer-analyzer",
    equation: (
      <>
        v<sup>2</sup> = μ(2/r − 1/a)
      </>
    ),
    equationLabel: "v squared equals mu times 2 over r minus 1 over a.",
    title: "Hohmann transfer",
  },
];

/**
 * A ruled list (design v3 section 6): the tool name as a text link, and its
 * equation in the data face. From 48rem the equation sits in a second
 * column that starts at a fixed track, left-aligned, so the three
 * equations line up with each other rather than with the right edge.
 * No numbers, no cards.
 */
export function FeaturedTools() {
  return (
    <section
      aria-labelledby="home-tools-title"
      className="border-t border-border-subtle"
    >
      <Container className="py-12">
        <h2 className="orbix-h2" id="home-tools-title">
          Three tools to start with
        </h2>
        <ul className="mt-7 border-b border-border-subtle">
          {TOOLS.map((tool) => (
            <li
              className="grid gap-x-10 gap-y-2 border-t border-border-subtle py-4 md:grid-cols-[22rem_minmax(0,1fr)] md:items-baseline"
              key={tool.anchor}
            >
              <h3 className="orbix-h3 min-w-0">
                <Link
                  className="inline-flex items-center gap-2 text-foreground underline decoration-transparent decoration-1 underline-offset-[3px] transition-colors hover:decoration-current"
                  href={`/engineering-lab#${tool.anchor}`}
                >
                  {tool.title}
                  <ButtonArrowIcon direction="right" />
                </Link>
              </h3>
              <p className="orbix-data m-0 min-w-0 text-foreground">
                <span aria-hidden="true">{tool.equation}</span>
                <span className="sr-only">{tool.equationLabel}</span>
              </p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
