// components/dashboard/data-table-column-header.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { Column } from '@tanstack/react-table';
import { ArrowUpDown, Filter, RotateCcw, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface DataTableColumnHeaderProps<TData, TValue> {
  column: Column<TData, TValue>;
  title: string;
  className?: string;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  const [searchTerm, setSearchTerm] = useState('');

  const facetedUniqueValues = column.getFacetedUniqueValues();
  const allUniqueValues = useMemo(() => {
    return Array.from(facetedUniqueValues.keys()).sort();
  }, [facetedUniqueValues]);

  const displayedValues = useMemo(() => {
    if (!searchTerm) return allUniqueValues;
    return allUniqueValues.filter((v) => String(v).toLowerCase().includes(searchTerm.toLowerCase()));
  }, [allUniqueValues, searchTerm]);

  const filterValue = column.getFilterValue() as string[] | undefined;
  const isFiltered = column.getIsFiltered();
  const isAllSelected = !isFiltered || filterValue === undefined;

  // Reflect search to selection realtime
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    if (value.length > 0) {
      const hits = allUniqueValues
        .filter((v) => String(v).toLowerCase().includes(value.toLowerCase()))
        .map((v) => String(v));

      column.setFilterValue(hits.length === allUniqueValues.length ? undefined : hits);
    } else {
      column.setFilterValue(undefined);
    }
  };

  const toggleFilter = (value: string) => {
    const currentBase = isAllSelected ? allUniqueValues.map((v) => String(v)) : filterValue || [];
    const newFilter = currentBase.includes(value) ? currentBase.filter((v) => v !== value) : [...currentBase, value];

    if (newFilter.length === allUniqueValues.length) {
      column.setFilterValue(undefined);
    } else {
      column.setFilterValue(newFilter);
    }
  };

  const handleSelectAllToggle = () => {
    if (isAllSelected) {
      column.setFilterValue([]); // Select none
    } else {
      column.setFilterValue(undefined); // Select all
    }
  };

  if (!column.getCanSort() && !column.getCanFilter()) {
    return <div className={cn('text-xs font-bold uppercase py-2 px-1', className)}>{title}</div>;
  }

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <Popover
        onOpenChange={(open) => {
          if (!open) setSearchTerm('');
        }}
      >
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn('-ml-3 h-8 hover:bg-accent data-[state=open]:bg-accent', isFiltered && 'text-primary')}
          >
            <span className="font-bold">{title}</span>
            {column.getIsSorted() === 'desc' ? (
              <ArrowUpDown className="ml-2 h-4 w-4 rotate-180" />
            ) : column.getIsSorted() === 'asc' ? (
              <ArrowUpDown className="ml-2 h-4 w-4 text-primary" />
            ) : (
              <Filter
                className={cn(
                  'ml-2 h-3 w-3 transition-all',
                  isFiltered ? 'fill-primary text-primary opacity-100' : 'opacity-40',
                )}
              />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-0 shadow-xl border-muted-foreground/20" align="start">
          <div className="p-2 space-y-2 text-foreground">
            {/* Sort Section */}
            <div className="flex flex-col gap-1">
              <p className="text-[10px] font-bold text-muted-foreground uppercase px-2 py-1 tracking-wider">Sort</p>
              <Button
                variant="ghost"
                size="sm"
                className="justify-start h-8 text-xs font-normal"
                onClick={() => column.toggleSorting(false)}
              >
                Ascending
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="justify-start h-8 text-xs font-normal"
                onClick={() => column.toggleSorting(true)}
              >
                Descending
              </Button>
              {(column.getIsSorted() || isFiltered) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start h-8 text-xs text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    column.clearSorting();
                    column.setFilterValue(undefined);
                  }}
                >
                  <RotateCcw className="mr-2 h-3 w-3" /> Reset Column
                </Button>
              )}
            </div>

            <div className="border-t mx-1" />

            {/* Filter Section */}
            <div className="flex flex-col gap-1">
              <p className="text-[10px] font-bold text-muted-foreground uppercase px-2 py-1 tracking-wider">Filter</p>
              <div className="px-2 pb-1 relative">
                <Search className="absolute left-4 top-2.5 h-3 w-3 text-muted-foreground" />
                <Input
                  placeholder="Search values..."
                  className="h-7 text-xs pl-8 bg-muted/30 focus-visible:ring-1"
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    className="absolute right-3 top-1.5 h-5 w-5 p-0 hover:bg-transparent"
                    onClick={() => handleSearchChange('')}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>

              <ScrollArea className="h-[180px] px-1">
                <div className="space-y-0.5">
                  <div
                    className="flex items-center space-x-2 p-1.5 hover:bg-accent rounded-md cursor-pointer transition-colors"
                    onClick={handleSelectAllToggle}
                  >
                    <Checkbox checked={isAllSelected} className="h-3.5 w-3.5" />
                    <span className="text-xs font-semibold">(Select All)</span>
                  </div>
                  {displayedValues.map((value) => {
                    const sValue = String(value);
                    const isChecked = isAllSelected || (filterValue || []).includes(sValue);
                    return (
                      <div
                        key={sValue}
                        className="flex items-center space-x-2 p-1.5 hover:bg-accent rounded-sm cursor-pointer transition-colors"
                        onClick={() => toggleFilter(sValue)}
                      >
                        <Checkbox checked={isChecked} className="h-3.5 w-3.5" />
                        <span className="text-xs truncate font-normal">{sValue}</span>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
