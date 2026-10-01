import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { keepDesignations } from "./designations";

function render(text: string) {
  return renderToStaticMarkup(<p>{keepDesignations(text)}</p>);
}

describe("keepDesignations", () => {
  it("keeps each hyphenated designation on one line", () => {
    expect(render("F-1 and J-2 engines")).toBe(
      '<p><span class="whitespace-nowrap">F-1</span> and <span class="whitespace-nowrap">J-2</span> engines</p>',
    );
    expect(render("the operational F-22 variant")).toContain(
      '<span class="whitespace-nowrap">F-22</span>',
    );
    expect(render("Two F119-PW-100 engines")).toContain(
      '<span class="whitespace-nowrap">F119-PW-100</span>',
    );
    expect(render("F-22A and RS-25")).toContain(
      '<span class="whitespace-nowrap">F-22A</span>',
    );
  });

  it("leaves ordinary hyphenated words and the text itself alone", () => {
    expect(render("two-stage, low-Earth and U.S.-built")).toBe(
      "<p>two-stage, low-Earth and U.S.-built</p>",
    );
    expect(
      render("Two F119-PW-100 engines power the F-22").replace(/<[^>]+>/g, ""),
    ).toBe("Two F119-PW-100 engines power the F-22");
  });
});
