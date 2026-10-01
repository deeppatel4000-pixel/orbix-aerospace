import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { formatCode, formatFigure } from "@/components/ui/readout";

function html(node: React.ReactNode) {
  return renderToStaticMarkup(<>{node}</>);
}

describe("formatFigure", () => {
  it("wraps decimal points and thousands separators between digits", () => {
    expect(html(formatFigure("Mach 3.25"))).toBe(
      'Mach 3<span class="orbix-num-sep">.</span>25',
    );
    expect(html(formatFigure("50,000 ft"))).toBe(
      '50<span class="orbix-num-sep">,</span>000 ft',
    );
    expect(html(formatFigure(1.5))).toBe(
      '1<span class="orbix-num-sep">.</span>5',
    );
  });

  it("leaves prose punctuation and bare integers alone", () => {
    expect(formatFigure("U.S. government, 1964")).toBe("U.S. government, 1964");
    expect(formatFigure(3)).toBe(3);
  });

  it("walks fragments, arrays and HTML elements such as sub and sup", () => {
    const equation = (
      <>
        q = 0.5 × ρ × V<sup>2</sup> + m<sub>0.25</sub>
      </>
    );
    const markup = html(formatFigure(equation));
    expect(markup).toBe(
      'q = 0<span class="orbix-num-sep">.</span>5 × ρ × V<sup>2</sup> + m<sub>0<span class="orbix-num-sep">.</span>25</sub>',
    );
    expect(html(formatFigure(["1.5 ", <b key="b">2,000</b>]))).toBe(
      '1<span class="orbix-num-sep">.</span>5 <b>2<span class="orbix-num-sep">,</span>000</b>',
    );
  });

  it("leaves components alone", () => {
    function Figure() {
      return <span>2.5</span>;
    }
    const node = <Figure />;
    expect(formatFigure(node)).toBe(node);
  });
});

describe("formatCode", () => {
  it("centres . and : between word characters and breaks after /", () => {
    expect(html(formatCode("npm run check:design"))).toBe(
      'npm run check<span class="orbix-num-sep">:</span>design',
    );
    expect(html(formatCode("github.com/a/b"))).toBe(
      'github<span class="orbix-num-sep">.</span>com/<wbr/>a/<wbr/>b',
    );
  });

  it("can keep a path argument on one line", () => {
    expect(
      html(formatCode("tests/e2e/smoke", { breakAfterSlash: false })),
    ).toBe("tests/e2e/smoke");
  });

  it("leaves text without code marks alone", () => {
    expect(formatCode("npm run lint")).toBe("npm run lint");
    expect(formatCode("--project=mobile")).toBe("--project=mobile");
  });
});
