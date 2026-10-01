"use client";

import { useSyncExternalStore, type MouseEvent } from "react";
import { CircleAlert } from "lucide-react";

/**
 * The submit-time summary of everything wrong with the form (spec 9).
 *
 * Each field already renders its own message under the input it belongs to,
 * so this is a roll-up on the page ground under a single 2px danger top
 * rule (spec 3.2: no panel, never a side stripe), the heading "Check these
 * inputs", and one entry per problem. When the errors are passed as a
 * record keyed by field name together with the fields' `idPrefix`, every
 * entry is a link that moves focus to its field, and the entries follow the
 * fields' on-screen order rather than the order of the record, so the first
 * entry is the field that receives focus. `role="alert"` announces the
 * summary when it appears in response to a submit.
 */

type ErrorList = readonly (string | undefined)[];
type ErrorRecord = Readonly<Partial<Record<string, string | undefined>>>;

interface ValidationErrorSummaryProps {
  errors: ErrorList | ErrorRecord;
  /** Prefix used by the fields' ids (`<idPrefix>-<field>`), enables links. */
  idPrefix?: string;
}

interface SummaryEntry {
  readonly message: string;
  readonly targetId: string | null;
}

function toEntries(
  errors: ErrorList | ErrorRecord,
  idPrefix: string | undefined,
): SummaryEntry[] {
  const seen = new Set<string>();
  const entries: SummaryEntry[] = [];
  const pairs: [string | null, string | undefined][] = Array.isArray(errors)
    ? (errors as ErrorList).map((message) => [null, message])
    : Object.entries(errors as ErrorRecord).map(([key, message]) => [
        key,
        message,
      ]);

  for (const [key, message] of pairs) {
    if (message === undefined || seen.has(message)) continue;
    seen.add(message);
    entries.push({
      message,
      targetId:
        idPrefix !== undefined && key !== null && key !== "form"
          ? idPrefix + "-" + key
          : null,
    });
  }

  return entries;
}

/**
 * Sorts linked entries by the document position of their target fields.
 * Entries without a target (form-level messages) keep their place after the
 * linked ones; entries whose field is not in the document keep record order.
 */
function sortByFieldPosition(entries: SummaryEntry[]): SummaryEntry[] {
  const withNodes = entries.map((entry, index) => ({
    entry,
    index,
    node: entry.targetId ? document.getElementById(entry.targetId) : null,
  }));

  return withNodes
    .sort((a, b) => {
      if (a.node && b.node) {
        if (a.node === b.node) return a.index - b.index;
        return a.node.compareDocumentPosition(b.node) &
          Node.DOCUMENT_POSITION_FOLLOWING
          ? -1
          : 1;
      }
      if (a.node) return -1;
      if (b.node) return 1;
      return a.index - b.index;
    })
    .map(({ entry }) => entry);
}

function subscribeToNothing() {
  return () => {};
}

function focusField(event: MouseEvent<HTMLAnchorElement>, targetId: string) {
  const target = document.getElementById(targetId);
  if (!target) return;
  event.preventDefault();
  target.focus();
  target.scrollIntoView({ block: "center" });
}

export function ValidationErrorSummary({
  errors,
  idPrefix,
}: ValidationErrorSummaryProps) {
  // True only after hydration, so the server and first client render agree.
  const canReadDocument = useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  );
  const recordEntries = toEntries(errors, idPrefix);
  const entries = canReadDocument
    ? sortByFieldPosition(recordEntries)
    : recordEntries;

  if (entries.length === 0) return null;

  return (
    <div className="orbix-error-summary mt-6" role="alert">
      <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <CircleAlert
          aria-hidden="true"
          className="shrink-0 text-status-danger"
          size={16}
        />
        Check these inputs
      </p>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-text-secondary">
        {entries.map(({ message, targetId }) => (
          <li key={message}>
            {targetId ? (
              <a
                className="orbix-link"
                href={"#" + targetId}
                onClick={(event) => focusField(event, targetId)}
              >
                {message}
              </a>
            ) : (
              message
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
