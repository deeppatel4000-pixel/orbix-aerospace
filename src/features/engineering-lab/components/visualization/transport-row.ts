/**
 * One transport layout for the replay, the walkthrough and the guided demo:
 * the primary action (play or next step), then previous and restart as
 * underlined text links (tertiary, spec 9). Below 30rem the four controls
 * form a 2 x 2 grid instead of wrapping one control onto a line of its own.
 */
export const TRANSPORT_ROW_CLASS =
  "grid grid-cols-2 gap-x-6 gap-y-2 min-[30rem]:flex min-[30rem]:flex-wrap min-[30rem]:items-center";
