'use client';

import { useMemo, useState } from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  getFacetedUniqueValues,
  getFacetedRowModel,
  FilterFn,
} from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { DataTableColumnHeader } from './data-table-column-header';

type LayoutMode =
  | 'fit' // fit to content
  | 'full' // use full width
  | 'equal' // full width and equal width per column
  | 'flexible'; // basically full width but let numbers minimal and others take space

interface GenericDataTableProps<TData> {
  data: TData[];
  columnLabels?: Record<string, string>;
  layoutMode?: LayoutMode;
}

const hybridFilter: FilterFn<any> = (row, columnId, filterValue) => {
  if (filterValue === undefined || filterValue === null || filterValue === '') return true;
  if (Array.isArray(filterValue) && filterValue.length === 0) return false;

  const rowValue = String(row.getValue(columnId)).toLowerCase();

  if (Array.isArray(filterValue)) {
    return filterValue.map((v) => String(v).toLowerCase()).includes(rowValue);
  }
  if (typeof filterValue === 'string') {
    return rowValue.includes(filterValue.toLowerCase());
  }
  return true;
};

export function GenericDataTable<TData extends Record<string, any>>({
  data,
  columnLabels = {},
  layoutMode = 'full',
}: GenericDataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const columns = useMemo<ColumnDef<TData>[]>(() => {
    if (!data || data.length === 0) return [];
    const keys = Object.keys(data[0]);

    return keys.map((key) => {
      // text right or left based on data type
      const isNumber = typeof data[0][key] === 'number';

      return {
        accessorKey: key,
        filterFn: hybridFilter,
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={columnLabels[key] || key}
            className={isNumber ? 'justify-end text-right' : 'justify-start text-left'}
          />
        ),
        cell: ({ row }) => {
          const value = row.getValue(key);
          if (value === null || value === undefined) return <span className="text-muted-foreground/30">-</span>;

          if (typeof value === 'number') {
            return <div className="text-right font-mono font-medium">{value.toLocaleString()}</div>;
          }
          if (value instanceof Date) {
            return <div className="text-right font-mono text-muted-foreground">{value.toLocaleDateString()}</div>;
          }
          return <div className="truncate">{String(value)}</div>;
        },
      };
    });
  }, [data, columnLabels]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  const columnCount = columns.length;
  const containerStyles = {
    fit: 'w-fit min-w-[600px]',
    full: 'w-full',
    equal: 'w-full',
    flexible: 'w-full',
  }[layoutMode];

  const tableStyles = {
    fit: 'table-auto w-full',
    full: 'table-auto w-full',
    equal: 'table-fixed w-full',
    flexible: 'table-auto w-full',
  }[layoutMode];

  return (
    <div className="space-y-4">
      <div className={cn('rounded-md border bg-card overflow-hidden transition-all', containerStyles)}>
        <Table className={tableStyles}>
          <TableHeader className="bg-muted/30">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent border-b">
                {headerGroup.headers.map((header) => {
                  const isNumber = typeof data[0][header.id] === 'number';
                  let widthClass = 'px-4';
                  if (layoutMode === 'equal') {
                    widthClass += ` w-[${100 / columnCount}%]`;
                  } else if (layoutMode === 'flexible') {
                    widthClass += isNumber ? ' w-[1%] whitespace-nowrap' : ' w-auto';
                  } else if (layoutMode === 'fit') {
                    widthClass += ' w-[1%] whitespace-nowrap';
                  }
                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        'h-10 text-xs font-bold uppercase tracking-tight',
                        widthClass,
                        isNumber ? 'text-right' : 'text-left',
                      )}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.map((row) => (
              <TableRow key={row.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                {row.getVisibleCells().map((cell) => {
                  const isNumber = typeof data[0][cell.column.id] === 'number';
                  return (
                    <TableCell key={cell.id} className={cn('py-2.5 px-4 whitespace-nowrap', isNumber && 'text-right')}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-end space-x-2">
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          Previous
        </Button>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          Next
        </Button>
      </div>
    </div>
  );
}
