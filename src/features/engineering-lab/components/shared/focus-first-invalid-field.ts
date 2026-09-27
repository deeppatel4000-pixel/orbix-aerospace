import type { KeyboardEvent } from "react";

/**
 * Moves focus to the first invalid control in a form once React has rendered
 * the error state. Call it from a submit handler after validation fails, with
 * the form element (`event.currentTarget`), so keyboard and screen reader
 * users land on the field that needs changing.
 */
export function focusFirstInvalidField(form: HTMLFormElement | null) {
  if (!form) return;

  const focus = () => {
    const target = form.querySelector<HTMLElement>(
      '[aria-invalid="true"]:not([disabled])',
    );
    target?.focus();
  };

  if (typeof window.requestAnimationFrame === "function") {
    window.requestAnimationFrame(focus);
  } else {
    window.setTimeout(focus, 0);
  }
}

const ENTER_IGNORED_INPUT_TYPES = new Set([
  "button",
  "checkbox",
  "file",
  "image",
  "radio",
  "reset",
  "submit",
]);

/**
 * `onKeyDown` handler for live forms that have no submit button. Browsers
 * only submit a multi-field form on Enter when it has a submit button, so
 * without this, pressing Enter in a field would do nothing. It treats Enter
 * in a text-like input as a submit attempt: the key press is consumed and
 * focus moves to the first invalid field, if there is one.
 */
export function focusFirstInvalidFieldOnEnter(
  event: KeyboardEvent<HTMLFormElement>,
) {
  if (event.key !== "Enter" || event.nativeEvent.isComposing) return;

  const target = event.target;
  if (
    !(target instanceof HTMLInputElement) ||
    ENTER_IGNORED_INPUT_TYPES.has(target.type)
  ) {
    return;
  }

  event.preventDefault();
  focusFirstInvalidField(event.currentTarget);
}
