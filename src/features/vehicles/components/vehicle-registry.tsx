"use client";

import { Search } from "lucide-react";
import { useId, useRef, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Eyebrow } from "@/components/ui/eyebrow";
import { cn } from "@/lib/cn";

export interface VehicleRegistryEntry {
  /** The rendered card. */
  readonly card: ReactNode;
  /**
   * Spans two grid columns wherever the grid has two or more (from 40rem;
   * spec 8: vary emphasis, the first card in a registry spans two
   * columns). With five vehicles that also leaves no card alone on the
   * last row of the two-column grid. Render its card with a feature layout.
   */
  readonly featured?: boolean;
  readonly id: string;
  /** Text the search matches against: name, maker, roles and so on. */
  readonly keywords: string;
}

interface VehicleRegistryProps {
  /** One sentence under the heading. */
  description: string;
  entries: readonly VehicleRegistryEntry[];
  /** Short label above the heading, sentence case. */
  eyebrow: string;
  /** Id of the results section, kept stable for deep links. */
  id: string;
  /** "aircraft" / "launch vehicle", used in the count and messages. */
  noun: { plural: string; singular: string };
  /** Visible label for the search field, for example "Search aircraft". */
  searchLabel: string;
  /** Help text under the search field. */
  searchHelp: string;
  /** The section's visible H2. */
  title: string;
}

function normalise(value: string) {
  return value.toLocaleLowerCase("en-US").replace(/\s+/g, " ").trim();
}

/**
 * The registry (spec 8, 9): a heading row with the search field and a live
 * result count, then a grid of card links (1 column, 2 from 40rem, 3 from
 * 64rem) whose featured first card spans two columns from 40rem. Every card is
 * rendered on the server, so the full list is present without JavaScript;
 * the search only hides non-matching cards.
 */
export function VehicleRegistry({
  description,
  entries,
  eyebrow,
  id,
  noun,
  searchHelp,
  searchLabel,
  title,
}: VehicleRegistryProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const helpId = `${inputId}-help`;

  const terms = normalise(query).split(" ").filter(Boolean);
  const matches = entries.filter((entry) => {
    const haystack = normalise(entry.keywords);
    return terms.every((term) => haystack.includes(term));
  });
  const count = matches.length;
  const countLabel = `${count} ${count === 1 ? noun.singular : noun.plural}`;

  return (
    <section aria-labelledby={`${id}-title`} className="scroll-mt-24" id={id}>
      <div className="grid gap-8 border-b border-border pb-8 lg:grid-cols-12 lg:items-end lg:gap-6">
        <div className="lg:col-span-7">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2 className="orbix-h2 mt-4 text-foreground" id={`${id}-title`}>
            {title}
          </h2>
          <p className="mt-4 max-w-[60ch] text-pretty text-text-secondary">
            {description}
          </p>
        </div>

        <div className="lg:col-span-5">
          <div className="orbix-field w-full">
            <label className="orbix-field__label" htmlFor={inputId}>
              {searchLabel}
            </label>
            <div className="orbix-field__control">
              <Search
                aria-hidden="true"
                className="orbix-field__icon orbix-field__icon--start"
                size={16}
              />
              <input
                aria-controls={`${id}-list`}
                aria-describedby={helpId}
                autoComplete="off"
                className="orbix-input"
                id={inputId}
                ref={inputRef}
                onChange={(event) => setQuery(event.target.value)}
                spellCheck={false}
                type="search"
                value={query}
              />
            </div>
            <p className="orbix-field__help" id={helpId}>
              {searchHelp}
            </p>
          </div>
          <p
            aria-live="polite"
            className="orbix-caps mt-4 text-muted"
            role="status"
          >
            {query.trim() === ""
              ? `Showing ${countLabel}`
              : `${countLabel} ${count === 1 ? "matches" : "match"} “${query.trim()}”`}
          </p>
        </div>
      </div>

      <ul
        className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        hidden={count === 0}
        id={`${id}-list`}
      >
        {entries.map((entry) => (
          <li
            className={cn(entry.featured && "sm:col-span-2")}
            hidden={!matches.includes(entry)}
            key={entry.id}
          >
            {entry.card}
          </li>
        ))}
      </ul>

      {count === 0 ? (
        <EmptyState
          action={
            <Button
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              variant="secondary"
            >
              Clear the search
            </Button>
          }
          className="mt-8"
          description={`No ${noun.plural} match “${query.trim()}”. Try a name, a maker or a role, or clear the search to see all ${entries.length}.`}
          title={`No matching ${noun.plural}`}
        />
      ) : null}
    </section>
  );
}
