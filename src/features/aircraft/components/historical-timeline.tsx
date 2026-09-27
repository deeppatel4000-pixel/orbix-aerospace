import {
  formatAircraftVariantStatus,
  formatFirstFlight,
} from "@/features/aircraft/utils";
import { VehicleProfileSection } from "@/features/vehicles/components/vehicle-profile-section";
import type { Aircraft, IsoDateString } from "@/features/vehicles/types";

interface HistoricalTimelineProps {
  aircraft: Aircraft;
}

interface TimelineEvent {
  readonly date?: IsoDateString;
  readonly key: string;
  readonly text: string;
}

/**
 * The events the record actually dates: the program's first flight, then
 * each variant's first flight in date order. A variant whose first flight is
 * the program's own is folded into that entry. Variants with no published date
 * follow, marked as such rather than given a guessed year.
 */
function buildEvents(aircraft: Aircraft): readonly TimelineEvent[] {
  const firstVariants = aircraft.variants
    .filter((variant) => variant.firstFlight === aircraft.firstFlight)
    .map((variant) => variant.designation);
  const dated: TimelineEvent[] = [
    {
      date: aircraft.firstFlight,
      key: "program",
      text:
        firstVariants.length > 0
          ? `First flight of the ${aircraft.name} (${firstVariants.join(", ")}).`
          : `First flight of the ${aircraft.name}.`,
    },
  ];
  const undated: TimelineEvent[] = [];

  for (const variant of aircraft.variants) {
    const status = formatAircraftVariantStatus(
      variant.status,
    ).toLocaleLowerCase("en-US");

    if (!variant.firstFlight) {
      undated.push({
        key: variant.id,
        text: `${variant.name} (${variant.designation}), ${status}.`,
      });
    } else if (variant.firstFlight !== aircraft.firstFlight) {
      dated.push({
        date: variant.firstFlight,
        key: variant.id,
        text: `First flight of the ${variant.name} (${variant.designation}), now ${status}.`,
      });
    }
  }

  dated.sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""));
  return [...dated, ...undated];
}

/** History (spec 14): an ordered list with dates; timeline dots are circles. */
export function HistoricalTimeline({ aircraft }: HistoricalTimelineProps) {
  const events = buildEvents(aircraft);

  return (
    <VehicleProfileSection
      description="Dates recorded for the program and its variants."
      id="history"
      title="History"
    >
      <ol className="relative flex flex-col gap-6 border-l border-border pl-6">
        {events.map((event) => (
          <li className="relative" key={event.key}>
            <span
              aria-hidden="true"
              className="absolute top-2 -left-6 size-2 -translate-x-1/2 rounded-full bg-border-strong"
            />
            <p className="text-sm text-muted">
              {event.date ? (
                <time className="orbix-data" dateTime={event.date}>
                  {formatFirstFlight(event.date)}
                </time>
              ) : (
                "First flight date not published"
              )}
            </p>
            <p className="mt-1 text-text-secondary">{event.text}</p>
          </li>
        ))}
      </ol>
    </VehicleProfileSection>
  );
}
