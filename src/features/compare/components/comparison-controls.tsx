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
 * Selection for `/compare` (design v3, spec 11): text choices for the
 * vehicle type (native radios, so arrow keys move between them), then one
 * open toggle tile per vehicle (`aria-pressed`) with a checkbox glyph, then
 * one primary action. Nothing navigates until the action is taken, so the table never
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
      {/* From 64rem the heading, the vehicle type choice and the count share
          one row, so the tiles start high on the page. */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
        <div>
          {/* A section heading at h3 scale: "Spec sheet" is the page's one
              display H2, so the picker reads as a step, not a second hero. */}
          <h2 className="orbix-h3 text-foreground" id="compare-selection-title">
            Choose vehicles
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted" id="compare-help">
            Choose two, a third is optional. The order you choose them in is the
            column order.
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-x-8 gap-y-3">
          <fieldset>
            <legend className="orbix-label">Vehicle type</legend>
            {/* Text choices, the chosen one in ink with an accent underline.
                Native radios keep the group semantics and arrow keys. */}
            <div className="flex gap-6">
              {categoryOptions.map((option) => (
                <label
                  className={cn(
                    "relative inline-flex min-h-11 cursor-pointer items-center text-base font-medium text-muted underline decoration-transparent decoration-2 underline-offset-[6px] transition-colors duration-200 select-none hover:text-foreground motion-reduce:transition-none",
                    "has-[:checked]:text-foreground has-[:checked]:decoration-accent",
                    "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--orbix-focus)]",
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
            className="flex min-h-11 items-center text-sm leading-6 text-muted"
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

      <fieldset className="mt-8">
        <legend className="sr-only">
          {isAircraft ? "Aircraft" : "Launch vehicles"}
        </legend>

        {/* Below 40rem each vehicle is a ruled catalogue row: checkbox,
            thumbnail, name, maker and credit. From 40rem the rows become
            open tiles, three across and five from 64rem: a hard-edged
            photo plate with its one-line credit under it as the catalogue
            caption (so every tile's text starts on one line), then the name
            with the checkbox at its right end, the maker and the column
            number, all flush with the plate's left edge. The checkbox is
            the only boxed element. */}
        <ul className="grid grid-cols-1 max-sm:border-b max-sm:border-border-subtle sm:grid-cols-3 sm:gap-x-5 sm:gap-y-8 lg:grid-cols-5">
          {vehicleOptions.map((option, index) => {
            const thumbnail = categoryThumbnails[option.id];
            const position = selection.indexOf(option.id);
            const isSelected = position !== -1;
            const isBlocked = isFull && !isSelected;
            const nameId = "compare-name-" + option.id;
            const makerId = "compare-maker-" + option.id;
            const creditId = "compare-credit-" + option.id;

            return (
              <li
                className="max-sm:border-t max-sm:border-border-subtle"
                key={option.id}
              >
                {/* Named by the vehicle and its maker only; the photo credit
                    is a description, so a screen reader does not repeat it
                    before the state. */}
                <button
                  aria-describedby={cn(
                    thumbnail && creditId,
                    "compare-count compare-help",
                  )}
                  aria-labelledby={nameId + " " + makerId}
                  aria-pressed={isSelected}
                  className="group grid w-full cursor-pointer grid-cols-[auto_auto_minmax(0,1fr)] items-center gap-x-4 py-3 text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--orbix-focus)] sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start sm:gap-x-3 sm:py-0 sm:[grid-template-areas:'plate_plate'_'credit_credit'_'name_box'_'maker_maker'_'column_column']"
                  onClick={() => toggleVehicle(option.id, option.name)}
                  type="button"
                >
                  {/* The photo plate: a thumbnail in the row below 40rem,
                      the full tile width above it. */}
                  <span
                    className={cn(
                      "relative order-2 block overflow-hidden bg-background sm:w-full sm:[grid-area:plate]",
                      isAircraft
                        ? "aspect-[16/10] h-14 sm:h-auto"
                        : "aspect-[3/4] h-[5.5rem] sm:aspect-[4/5] sm:h-auto",
                    )}
                  >
                    {thumbnail ? (
                      <Image
                        alt=""
                        className={cn(
                          "object-cover [object-position:var(--tile-pos)] saturate-[0.9] transition-opacity duration-200 motion-reduce:transition-none lg:[object-position:var(--tile-pos-lg)]",
                          isBlocked && "opacity-50",
                        )}
                        fill
                        // The first row is in view on load at tablet and
                        // desktop widths, so it is not lazy-loaded.
                        loading={index < 5 ? "eager" : undefined}
                        sizes={
                          isAircraft
                            ? "(min-width: 64rem) 13rem, (min-width: 40rem) 30vw, 5.5rem"
                            : "(min-width: 64rem) 13rem, (min-width: 40rem) 30vw, 4.125rem"
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

                  {/* Checkbox glyph, decorative: aria-pressed carries the
                      state. An empty 20px square at rest (3:1 outline), an
                      accent square with a check when chosen. Below 40rem
                      the column number sits under it; from 40rem the box
                      ends the name line and the number is its own line. */}
                  <span
                    aria-hidden="true"
                    className="order-1 flex flex-col items-center gap-1 sm:mt-3 sm:[grid-area:box]"
                  >
                    <span
                      className={cn(
                        "flex size-5 shrink-0 items-center justify-center rounded-[2px] border transition-colors duration-200 motion-reduce:transition-none",
                        isSelected
                          ? "border-accent bg-accent text-on-accent"
                          : "border-border-control group-hover:border-foreground",
                      )}
                    >
                      {isSelected ? <Check size={13} strokeWidth={3} /> : null}
                    </span>
                    <span
                      className={cn(
                        "orbix-readout-inline text-xs leading-4 text-muted sm:hidden",
                        !isSelected && "invisible",
                      )}
                    >
                      {isSelected ? position + 1 : null}
                    </span>
                  </span>

                  <span className="order-3 flex min-w-0 flex-col gap-1 sm:contents">
                    <span
                      id={nameId}
                      className={cn(
                        "font-display text-[1.25rem] leading-[1.05] tracking-[-0.03em] decoration-1 underline-offset-[3px] group-hover:underline sm:mt-3 sm:[grid-area:name]",
                        isBlocked ? "text-muted" : "text-foreground",
                      )}
                    >
                      {option.name}
                    </span>{" "}
                    <span
                      className="text-[0.8125rem] leading-5 text-muted sm:mt-1 sm:[grid-area:maker]"
                      id={makerId}
                    >
                      {option.manufacturer}
                    </span>
                    {thumbnail ? (
                      <span
                        className="orbix-micro text-[0.75rem] text-muted sm:mt-2 sm:[grid-area:credit]"
                        id={creditId}
                      >
                        <span className="sr-only">Photo: </span>
                        {shortCredit(thumbnail.credit, thumbnail.license)}
                      </span>
                    ) : null}
                    {/* The column this vehicle fills, from 40rem. The
                        live status already announces it on selection. */}
                    <span
                      aria-hidden="true"
                      className={cn(
                        "text-[0.8125rem] leading-5 text-muted max-sm:hidden sm:mt-1 sm:[grid-area:column]",
                        !isSelected && "invisible",
                      )}
                    >
                      {isSelected ? "Column " + (position + 1) : "Column"}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </fieldset>

      <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
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
          /* Stacked on a phone, the label lines up with the left edge. */
          className="self-start max-sm:border-x-0 max-sm:px-0"
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
