import type { ReactNode } from "react";

export interface DataTableColumn<T> {
  header: string;
  id: string;
  render: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  caption?: string;
  columns: DataTableColumn<T>[];
  getRowKey: (row: T) => string;
  rows: T[];
}

export function DataTable<T>({
  caption = "Data table",
  columns,
  getRowKey,
  rows,
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-lg border border-maroon/10 bg-card">
      <table className="w-full min-w-[44rem] border-collapse text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead className="border-b border-maroon/10 bg-linen/60">
          <tr>
            {columns.map((column) => (
              <th
                className="px-4 py-3 font-semibold text-charcoal"
                key={column.id}
                scope="col"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-maroon/10">
          {rows.map((row) => (
            <tr className="transition hover:bg-maroon/[0.025]" key={getRowKey(row)}>
              {columns.map((column) => (
                <td className="px-4 py-3 text-muted-foreground" key={column.id}>
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
