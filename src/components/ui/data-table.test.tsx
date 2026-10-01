import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { DataTable, type DataTableColumn } from "@/components/ui/data-table";

interface Row {
  readonly name: string;
  readonly thrust: string;
}

const columns: readonly DataTableColumn<Row>[] = [
  { cell: (row) => row.name, header: "Vehicle", key: "name" },
  {
    cell: (row) => row.thrust,
    header: "Thrust",
    key: "thrust",
    numeric: true,
    unit: "kN",
  },
];

const rows: readonly Row[] = [
  { name: "Falcon 9", thrust: "7,607" },
  { name: "Saturn V", thrust: "35,100" },
];

function render(stickyFirstColumn?: boolean) {
  return renderToStaticMarkup(
    <DataTable
      caption="Liftoff thrust"
      columns={columns}
      getRowKey={(row) => row.name}
      note="Sea-level figures."
      rows={rows}
      stickyFirstColumn={stickyFirstColumn}
    />,
  );
}

describe("DataTable", () => {
  it("names the table and its scroll region with the visible caption", () => {
    const markup = render();
    const id = markup.match(
      /<p class="orbix-data-table__caption" id="([^"]+)">Liftoff thrust<\/p>/,
    )?.[1];
    expect(id).toBeTruthy();
    expect(markup).toContain(
      `<div aria-labelledby="${id}" class="orbix-data-table__scroll" role="region" tabindex="0">`,
    );
    expect(markup).toContain(
      `<table aria-labelledby="${id}" class="orbix-table">`,
    );
  });

  it("uses column headers and makes the first column the row header", () => {
    const markup = render();
    expect(markup).toContain('<th scope="col">Vehicle</th>');
    expect(markup).toContain('<th scope="row">Falcon 9</th>');
    expect(markup.match(/<tr>/g)).toHaveLength(3);
  });

  it("sets numeric columns as right-aligned figures with the unit in the header", () => {
    const markup = render();
    expect(markup).toContain(
      '<th class="orbix-num" scope="col">Thrust<span class="orbix-table-unit"> (kN)</span></th>',
    );
    expect(markup).toContain(
      '<td class="orbix-num">35<span class="orbix-num-sep">,</span>100</td>',
    );
  });

  it("draws no frame and no fade: the scroll box holds the table directly", () => {
    const markup = render();
    expect(markup).not.toContain("orbix-data-table__frame");
    expect(markup).toMatch(
      /class="orbix-data-table__scroll" role="region" tabindex="0"><table/,
    );
  });

  it("keeps the first column sticky unless told not to", () => {
    expect(render()).toContain('data-sticky-first="true"');
    expect(render(false)).not.toContain("data-sticky-first");
  });

  it("keeps cells on one line below 48rem with singleLineCells, except wrap columns", () => {
    const markup = renderToStaticMarkup(
      <DataTable
        caption="Variants"
        columns={[
          ...columns,
          {
            cell: () => "A long note.",
            header: "Notes",
            key: "notes",
            wrap: true,
          },
        ]}
        getRowKey={(row) => row.name}
        rows={rows}
        singleLineCells
      />,
    );
    expect(markup).toContain(
      'class="orbix-table max-md:w-full max-md:min-w-max"',
    );
    expect(markup).toContain(
      '<th class="max-md:w-[8.5rem] max-md:min-w-[8.5rem] max-[22.5rem]:w-[7.5rem] max-[22.5rem]:min-w-[7.5rem]" scope="row">Falcon 9</th>',
    );
    expect(markup).toContain(
      '<td class="orbix-num max-md:whitespace-nowrap">35<span class="orbix-num-sep">,</span>100</td>',
    );
    expect(markup).toContain(
      '<td class="max-md:w-[18rem] max-md:min-w-[18rem]">A long note.</td>',
    );
  });

  it("folds a column under another column's cell below 40rem", () => {
    const markup = renderToStaticMarkup(
      <DataTable
        caption="Engines"
        columns={[
          ...columns,
          {
            cell: () => "Gas generator",
            foldInto: "name",
            header: "Cycle",
            key: "cycle",
          },
          {
            cell: () => "Not published",
            foldCell: () => "Stage not published",
            foldInto: "name",
            header: "Stage",
            key: "stage",
          },
        ]}
        getRowKey={(row) => row.name}
        rows={rows}
        singleLineCells
      />,
    );
    // The folded columns are hidden on a phone, header and cells.
    expect(markup).toContain(
      '<th class="max-sm:hidden" scope="col">Cycle</th>',
    );
    expect(markup).toContain(
      '<td class="max-md:whitespace-nowrap max-sm:hidden">Gas generator</td>',
    );
    // Their content rides under the first cell there, and only there.
    expect(markup).toMatch(
      /<th[^>]*scope="row">Falcon 9<span class="[^"]*sm:hidden" data-folded="cycle">Gas generator<\/span><span class="[^"]*sm:hidden" data-folded="stage">Stage not published<\/span><\/th>/,
    );
    // Below 40rem the table only fills its frame.
    expect(markup).toContain(
      'class="orbix-table max-md:w-full sm:max-md:min-w-max"',
    );
  });

  it("renders the note under the table", () => {
    expect(render()).toContain(
      '<p class="orbix-data-table__note">Sea-level figures.</p>',
    );
  });
});
