"use client";

import { Search } from "lucide-react";
import { useId, useRef, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export interface VehicleRegistryEntry {
  /** The rendered card. */
  readonly card: ReactNode;
  readonly id: string;
  /** Text the search matches against: name, maker, roles and so on. */
  readonly keywords: string;
}

interface VehicleRegistryProps {
  entries: readonly VehicleRegistryEntry[];
  /** Id of the results section, kept stable for deep links. */
  id: string;
  /** "aircraft" / "launch vehicle", used in the count and messages. */
  noun: { plural: string; singular: string };
  /** Visible label for the search field, for example "Search aircraft". */
  searchLabel: string;
  /** Help text under the search field. */
  searchHelp: string;
}

function normalise(value: string) {
  return value.toLocaleLowerCase("en-US").replace(/\s+/g, " ").trim();
}

/**
 * The registry filter row and results (spec 14): a labelled search field, a
 * live result count, and a grid of card links (1 column, 2 from 640px, 3 from
 * 1024px). Every card is rendered on the server, so the full list is present
 * without JavaScript; the search only hides non-matching cards.
 */
export function VehicleRegistry({
  entries,
  id,
  noun,
  searchHelp,
  searchLabel,
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
    <section aria-labelledby={`${id}-title`} id={id}>
      <h2 className="sr-only" id={`${id}-title`}>
        Results
      </h2>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="orbix-field w-full sm:max-w-sm">
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

        <p aria-live="polite" className="text-sm text-muted" role="status">
          {query.trim() === ""
            ? countLabel
            : `${countLabel} ${count === 1 ? "matches" : "match"} “${query.trim()}”`}
        </p>
      </div>

      <ul
        className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        hidden={count === 0}
        id={`${id}-list`}
      >
        {entries.map((entry) => (
          <li hidden={!matches.includes(entry)} key={entry.id}>
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
