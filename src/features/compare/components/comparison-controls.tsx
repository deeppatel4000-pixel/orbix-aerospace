"use client";

import {
  useEffect,
  useState,
  useTransition,
  type CSSProperties,
  type FormEvent,
} from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Check, CircleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { shortCredit } from "@/features/compare/components/photo-credit";
import { cn } from "@/lib/cn";
import {
  MAX_COMPARISON_VEHICLES,
  type ComparisonCategory,
  type ComparisonOptions,
} from "@/features/compare/types";

/** Photo record for one selectable tile, resolved on the server. */
export interface ComparisonThumbnail {
  readonly credit: string;
  readonly license: string;
  readonly objectPosition: string;
  readonly src: string;
  /** `object-position` for the tile from 64rem, when it differs. */
  readonly wideTilePosition?: string;
}

export type ComparisonThumbnails = Readonly<
  Record<
    ComparisonCategory,
    Readonly<Record<string, ComparisonThumbnail | undefined>>
  >
>;

interface ComparisonControlsProps {
  category: ComparisonCategory;
  options: ComparisonOptions;
  selectedIds: readonly string[];
  thumbnails: ComparisonThumbnails;
}

const categoryOptions: readonly {
  id: ComparisonCategory;
  label: string;
}[] = [
  { id: "aircraft", label: "Aircraft" },
  { id: "rockets", label: "Launch vehicles" },
];

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Selection for `/compare` (design v2, spec 9): a square segmented control
 * for the vehicle type (native radios, so arrow keys move between them),
 * then one toggle tile per vehicle (`aria-pressed`), then one primary
 * action. Nothing navigates until the action is taken, so the table never
 * changes under a keyboard or screen reader user while they are choosing.
 * Tiles keep the order they were chosen in, which is the column order.
 */
export function ComparisonControls({
  category,
  options,
  selectedIds,
  thumbnails,
}: ComparisonControlsProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [activeCategory, setActiveCategory] = useState(category);
  const [selection, setSelection] = useState<readonly string[]>(selectedIds);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  // Only whether a comparison was requested from this form is kept locally.
  // The status wording is derived from the URL-backed props, so it always
  // names the vehicles the table shows, including after browser back.
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Re-sync local state when the URL-derived props change for a reason other
  // than this form (browser back and forward, a link from a profile page).
  // Adjusting state during render is React's recommended alternative to an
  // effect for this.
  const syncKey = category + ":" + selectedIds.join(",");
  const [lastSyncKey, setLastSyncKey] = useState(syncKey);
  if (syncKey !== lastSyncKey) {
    setLastSyncKey(syncKey);
    setActiveCategory(category);
    setSelection(selectedIds);
    setError(null);
    setNotice("");
  }

  // After a comparison this form asked for has rendered, bring the spec
  // sheet into view: on a phone it is far below the tiles.
  useEffect(() => {
    if (!hasSubmitted || isPending) return;
    document.getElementById("comparison-results")?.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      block: "start",
    });
  }, [hasSubmitted, isPending, syncKey]);

  const shownNames = selectedIds
    .map((id) => options[category].find((option) => option.id === id)?.name)
    .filter(Boolean);
  const submittedStatus =
    hasSubmitted && activeCategory === category && shownNames.length >= 2
      ? "Showing the comparison of " + shownNames.join(", ") + "."
      : "";

  const vehicleOptions = options[activeCategory];
  const categoryThumbnails = thumbnails[activeCategory];
  const isAircraft = activeCategory === "aircraft";
  const plural = isAircraft ? "aircraft" : "launch vehicles";
  const isFull = selection.length >= MAX_COMPARISON_VEHICLES;

  function selectCategory(nextCategory: ComparisonCategory) {
    if (nextCategory === activeCategory) return;

    setActiveCategory(nextCategory);
    setSelection([]);
    setError(null);
    setNotice("");
    setHasSubmitted(false);
  }

  function toggleVehicle(id: string, name: string) {
    setError(null);
    setHasSubmitted(false);

    if (selection.includes(id)) {
      setSelection(selection.filter((value) => value !== id));
      setNotice(name + " removed.");
      return;
    }

    if (isFull) {
      setNotice(
        "Three vehicles is the most a comparison shows. Remove one before adding " +
          name +
          ".",
      );
      return;
    }

    setSelection([...selection, id]);
    setNotice(name + " added as column " + (selection.length + 1) + ".");
  }

  function clearSelection() {
    if (selection.length === 0) return;
    setSelection([]);
    setError(null);
    setHasSubmitted(false);
    setNotice("Selection cleared.");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (selection.length < 2) {
      setHasSubmitted(false);
      setNotice("");
      setError(
        selection.length === 0
          ? "Choose two " + plural + " to compare. A third is optional."
          : "Choose one more vehicle. A comparison needs at least two.",
      );
      return;
    }

    setError(null);
    setNotice("");
    // Ids are URL-safe slugs; the commas stay literal so the address reads
    // the same as the comparison links elsewhere on the site.
    const query =
      "?category=" +
      activeCategory +
      "&vehicles=" +
      selection
        .slice(0, MAX_COMPARISON_VEHICLES)
        .map((id) => encodeURIComponent(id))
        .join(",");

    setHasSubmitted(true);
    startTransition(() => {
      router.push(pathname + query, { scroll: false });
    });
  }

  const status = isPending
    ? "Loading the comparison."
    : error
      ? ""
      : notice || submittedStatus;

  return (
    <form
      aria-labelledby="compare-selection-title"
      noValidate
      onSubmit={handleSubmit}
    >
      {/* From 64rem the heading, the count and the vehicle type control
          share one row, so the tiles start high on the page. */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
        <div>
          <h2 className="orbix-h2 text-foreground" id="compare-selection-title">
            Choose vehicles
          </h2>
          <p
            className="mt-2 text-sm leading-6 text-muted lg:mt-3"
            id="compare-help"
          >
            Choose two, a third is optional. The order you choose them in is the
            column order.
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
          <fieldset>
            <legend className="orbix-caps text-muted max-lg:sr-only">
              Vehicle type
            </legend>
            {/* Square segmented control: one outline, hairline dividers,
                the chosen segment filled with the accent. Native radios
                keep the group semantics and arrow-key behaviour. */}
            <div className="inline-flex max-w-full rounded border border-border-control lg:mt-2">
              {categoryOptions.map((option, index) => (
                <label
                  className={cn(
                    "relative inline-flex min-h-11 cursor-pointer items-center px-5 text-[0.9375rem] font-medium text-text-secondary transition-colors duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] select-none hover:bg-surface-raised hover:text-foreground",
                    "has-[:checked]:bg-accent has-[:checked]:text-on-accent",
                    "first:rounded-l-[3px] last:rounded-r-[3px] has-[:focus-visible]:z-10 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-3 has-[:focus-visible]:outline-[var(--orbix-focus)]",
                    index > 0 && "border-l border-border-control",
                  )}
                  key={option.id}
                >
                  <input
                    checked={activeCategory === option.id}
                    className="absolute inset-0 m-0 cursor-pointer appearance-none opacity-0"
                    name="category"
                    onChange={() => selectCategory(option.id)}
                    type="radio"
                    value={option.id}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </fieldset>
          <p
            className="flex items-center text-sm leading-6 text-muted lg:min-h-11"
            id="compare-count"
          >
            <span className="orbix-readout-inline mr-1 text-[1.0625rem] text-foreground">
              {selection.length}
            </span>
            of
            <span className="orbix-readout-inline mx-1 text-[1.0625rem] text-foreground">
              {MAX_COMPARISON_VEHICLES}
            </span>
            selected
          </p>
        </div>
      </div>

      <fieldset className="mt-6">
        <legend className="sr-only">
          {isAircraft ? "Aircraft" : "Launch vehicles"}
        </legend>

        {/* From 64rem both categories use one tile: the photo on top, five
            across, so the launch vehicle row is as photo-led as the aircraft
            row in the same slot. Below 64rem aircraft photos are wide, so
            from 40rem their tiles stand with the photo on top in a
            six-column span grid, three tiles over two half-width tiles.
            Launch vehicle photos are tall (every vehicle whole), so below
            64rem their tiles keep the photo on the left, two across from
            40rem, and an odd last tile takes the full row. */}
        <ul
          className={cn(
            "grid grid-cols-1 gap-2 sm:gap-4",
            isAircraft
              ? "sm:max-lg:grid-cols-6 lg:grid-cols-5 sm:max-lg:[&>li]:col-span-2 sm:max-lg:[&>li:nth-child(n+4)]:col-span-3"
              : "sm:max-lg:grid-cols-2 lg:grid-cols-5 sm:max-lg:[&>li:last-child:nth-child(odd)]:col-span-2",
          )}
        >
          {vehicleOptions.map((option, index) => {
            const thumbnail = categoryThumbnails[option.id];
            const position = selection.indexOf(option.id);
            const isSelected = position !== -1;
            const isBlocked = isFull && !isSelected;
            const nameId = "compare-name-" + option.id;
            const makerId = "compare-maker-" + option.id;
            const creditId = "compare-credit-" + option.id;

            return (
              <li key={option.id}>
                {/* Named by the vehicle and its maker only; the photo credit
                    stays visible on the tile but is a description, so a
                    screen reader does not repeat it before the state. */}
                <button
                  aria-describedby={cn(
                    thumbnail && creditId,
                    "compare-count compare-help",
                  )}
                  aria-labelledby={nameId + " " + makerId}
                  aria-pressed={isSelected}
                  className={cn(
                    "group relative grid h-full w-full cursor-pointer grid-cols-[auto_minmax(0,1fr)] gap-3 overflow-hidden rounded-lg border bg-surface p-3 text-left transition-colors duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] active:translate-y-px",
                    isAircraft && "sm:flex sm:flex-col sm:gap-0 sm:p-0",
                    !isAircraft &&
                      "sm:gap-4 lg:flex lg:flex-col lg:gap-0 lg:p-0",
                    isSelected
                      ? "border-accent shadow-[inset_0_0_0_1px_var(--accent)] max-sm:bg-surface-raised"
                      : "border-border hover:border-border-control hover:bg-surface-raised",
                  )}
                  onClick={() => toggleVehicle(option.id, option.name)}
                  type="button"
                >
                  <span
                    className={cn(
                      "relative block self-start overflow-hidden rounded-md bg-background",
                      isAircraft
                        ? "aspect-[16/10] h-14 sm:h-auto sm:w-full sm:rounded-none"
                        : "aspect-[3/4] h-[5.5rem] sm:h-auto sm:w-24 lg:aspect-[4/5] lg:w-full lg:self-stretch lg:rounded-none",
                    )}
                  >
                    {thumbnail ? (
                      <Image
                        alt=""
                        className={cn(
                          "object-cover [object-position:var(--tile-pos)] contrast-[1.05] saturate-[0.85] transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100 lg:[object-position:var(--tile-pos-lg)]",
                          isBlocked && "opacity-50",
                        )}
                        fill
                        // The first row is in view on load at tablet and
                        // desktop widths, so it is not lazy-loaded.
                        loading={index < 5 ? "eager" : undefined}
                        sizes={
                          isAircraft
                            ? "(min-width: 64rem) 13rem, (min-width: 40rem) 30vw, 5.5rem"
                            : "(min-width: 64rem) 13rem, (min-width: 40rem) 6rem, 4.125rem"
                        }
                        src={thumbnail.src}
                        style={
                          {
                            "--tile-pos": thumbnail.objectPosition,
                            "--tile-pos-lg":
                              thumbnail.wideTilePosition ??
                              thumbnail.objectPosition,
                          } as CSSProperties
                        }
                      />
                    ) : null}
                  </span>

                  <span
                    className={cn(
                      "flex min-w-0 flex-1 flex-col gap-1.5",
                      isAircraft && "sm:gap-3 sm:p-4",
                      isAircraft && isSelected && "sm:bg-surface-raised",
                      "lg:gap-2 lg:p-3",
                      !isAircraft && isSelected && "lg:bg-surface-raised",
                    )}
                  >
                    <span className="flex flex-row-reverse items-start justify-between gap-2.5 lg:flex-row lg:justify-start">
                      {/* Check box at the top right of every tile: an empty
                          20px square at rest (3:1 outline), an accent square
                          with a check when chosen, the column number beside
                          it. The number keeps its slot when empty, so
                          choosing a tile moves nothing. Decorative:
                          aria-pressed carries the state. From 64rem, five
                          across, it moves to the photo's top right corner
                          on an opaque 28px plate (never bare over the photo),
                          so the name gets the full width of the tile. */}
                      <span
                        aria-hidden="true"
                        className="flex shrink-0 items-center gap-1.5 lg:absolute lg:top-2 lg:right-2 lg:z-10 lg:h-7 lg:rounded-[2px] lg:bg-background lg:px-1"
                      >
                        <span
                          className={cn(
                            "orbix-readout-inline w-3 text-center text-xs leading-none text-foreground",
                            !isSelected && "invisible lg:hidden",
                          )}
                        >
                          {isSelected ? position + 1 : null}
                        </span>
                        <span
                          className={cn(
                            "flex size-5 items-center justify-center rounded-[2px] border",
                            isSelected
                              ? "border-accent bg-accent text-on-accent"
                              : "border-border-control",
                          )}
                        >
                          {isSelected ? (
                            <Check size={12} strokeWidth={3} />
                          ) : null}
                        </span>
                      </span>
                      <span className="flex min-w-0 flex-col gap-1 lg:gap-2">
                        <span
                          id={nameId}
                          className={cn(
                            "font-display text-[1.125rem] leading-[1.1] tracking-[-0.03em] sm:text-[1.3125rem] sm:leading-[1.05]",
                            "lg:text-[1.25rem] lg:leading-[1.05]",
                            isBlocked ? "text-muted" : "text-foreground",
                          )}
                        >
                          {option.name}
                        </span>{" "}
                        <span
                          className="text-[0.8125rem] leading-5 text-muted"
                          id={makerId}
                        >
                          {option.manufacturer}
                        </span>
                      </span>
                    </span>
                    {thumbnail ? (
                      // Anchored to the tile foot. Five across from 64rem,
                      // "Steve Jurvetson, CC BY 2.0" needs two lines, so
                      // launch vehicle credits reserve two and every credit
                      // in that row starts at one height. It may wrap, but the
                      // no-break licence only breaks after the comma.
                      <span
                        className={cn(
                          "orbix-micro mt-auto text-[0.6875rem] text-muted",
                          !isAircraft && "lg:min-h-[2.9em]",
                        )}
                        id={creditId}
                      >
                        <span className="sr-only">Photo: </span>
                        {shortCredit(thumbnail.credit, thumbnail.license)}
                      </span>
                    ) : null}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </fieldset>

      <div className="mt-8 flex flex-col gap-4 border-t border-border-subtle pt-6 sm:flex-row sm:flex-wrap sm:items-center lg:mt-6 lg:pt-5">
        <Button
          aria-describedby={error ? "compare-error" : undefined}
          arrow="down"
          className="w-full sm:w-auto"
          size="lg"
          type="submit"
        >
          Compare selected vehicles
        </Button>
        {/* Always mounted: removing it while it has focus would drop a
            keyboard user back to the top of the page (WCAG 2.4.3). */}
        <Button
          aria-disabled={selection.length === 0 ? true : undefined}
          className="w-full sm:w-auto"
          onClick={clearSelection}
          variant="ghost"
        >
          Clear selection
        </Button>
        <p className="text-sm text-muted" id="compare-status" role="status">
          {status}
        </p>
        {error ? (
          <p
            className="orbix-field__error basis-full"
            id="compare-error"
            role="alert"
          >
            <CircleAlert aria-hidden="true" className="shrink-0" size={14} />
            {error}
          </p>
        ) : null}
      </div>
    </form>
  );
}
