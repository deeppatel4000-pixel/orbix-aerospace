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

  it("keeps the first column sticky unless told not to", () => {
    expect(render()).toContain('data-sticky-first="true"');
    expect(render(false)).not.toContain("data-sticky-first");
  });

  it("renders the note under the table", () => {
    expect(render()).toContain(
      '<p class="orbix-data-table__note">Sea-level figures.</p>',
    );
  });
});
