import { ArrowLeft, GitCompareArrows } from "lucide-react";

import { ButtonLink } from "@/components/ui/button-link";
import type { Rocket } from "@/features/vehicles/types";

interface RocketProfileCtaProps {
  rocket: Rocket;
}

export function RocketProfileCta({ rocket }: RocketProfileCtaProps) {
  return (
    <section
      aria-labelledby="rocket-profile-next-step"
      className="border-t border-atmosphere/20 py-16 sm:py-20"
    >
      <div className="orbix-frame relative overflow-hidden border-signal/25 bg-[#080c13] p-7 sm:p-10">
        <div
          aria-hidden="true"
          className="absolute -right-20 -bottom-28 h-72 w-72 rounded-full bg-signal/8 blur-3xl"
        />
        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <p className="font-mono text-[0.62rem] tracking-[0.18em] text-signal uppercase">
              Launch profile review complete
            </p>
            <h2
              className="font-display mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl"
              id="rocket-profile-next-step"
            >
              Continue the vehicle study.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted sm:text-base">
              Return to the launch-vehicle registry or place {rocket.name} into
              the existing ORBIX comparison workflow.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/rockets" variant="secondary">
              <ArrowLeft aria-hidden="true" size={16} /> Back to Explorer
            </ButtonLink>
            <ButtonLink
              href={`/compare?category=rockets&vehicles=${rocket.id}`}
            >
              <GitCompareArrows aria-hidden="true" size={16} /> Compare rocket
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
