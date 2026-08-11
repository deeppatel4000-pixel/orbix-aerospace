import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { OrbixEnvironmentBackdrop } from "@/components/brand/orbix-environment";
import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/features/home/components/section-heading";

/**
 * Mission visualization: the Mission Replay workspace inside the Engineering
 * Laboratory.
 *
 * The capabilities named here are the ones Mission Replay actually has, as
 * pinned by its own test suite: play, pause, restart, a speed selector,
 * selectable named phases, synchronized telemetry, and a 3D scene whose mode
 * follows the active phase.
 *
 * Deliberately NOT claimed: a continuous timeline scrubber. The progress bar
 * is a non-interactive `<progress>` element and phases are chosen from
 * buttons, so describing a scrubber would promise an interaction that does
 * not exist.
 */
const CAPABILITIES = [
  "Play, pause and restart a mission sequence",
  "Step directly to any named mission phase",
  "Read telemetry that stays synchronized with the active phase",
  "Watch the 3D scene follow the phase between orbital and reentry",
] as const;

export function MissionPreview() {
  return (
    <section
      aria-labelledby="mission-preview-title"
      className="relative isolate overflow-hidden border-b border-border-subtle py-20 sm:py-24 lg:py-28"
    >
      <OrbixEnvironmentBackdrop className="opacity-40" theme="orbital" />

      <Container className="relative">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:items-center lg:gap-20">
          <SectionHeading
            description="Completed mission analysis can be replayed phase by phase, with telemetry and a 3D scene that stay in step with the sequence."
            eyebrow="Mission visualization"
            title="Replay the mission, phase by phase."
            titleId="mission-preview-title"
          />

          <div>
            <ul className="flex flex-col gap-4 border-l border-border pl-6">
              {CAPABILITIES.map((capability) => (
                <li className="text-muted-strong leading-7" key={capability}>
                  {capability}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-x-8">
              <Link
                className="orbix-home-link"
                href="/engineering-lab#mission-control-dashboard"
              >
                Enter Mission Control{" "}
                <ArrowUpRight aria-hidden="true" size={15} />
              </Link>
              {/* `/showcase` is a real route carrying completed mission
                  narratives. The previous homepage linked to it, so this
                  keeps that destination reachable from the front door. */}
              <Link className="orbix-home-link" href="/showcase">
                Browse the mission showcase{" "}
                <ArrowUpRight aria-hidden="true" size={15} />
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
