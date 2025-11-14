'use client';

import { Filter, SortAsc, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export type SortOption = 'newest' | 'oldest' | 'most-explored' | 'most-viewed' | 'recently-updated';

export interface FilterOptions {
  tags: string[];
  hasExplorations: boolean | null;
  dateRange: 'all' | 'today' | 'week' | 'month' | 'year';
}

interface FilterSortProps {
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  availableTags: string[];
}

export function FilterSort({
  sortBy,
  onSortChange,
  filters,
  onFilterChange,
  availableTags,
}: FilterSortProps) {
  const activeFiltersCount = 
    filters.tags.length + 
    (filters.hasExplorations !== null ? 1 : 0) + 
    (filters.dateRange !== 'all' ? 1 : 0);

  const toggleTag = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag];
    onFilterChange({ ...filters, tags: newTags });
  };

  const clearFilters = () => {
    onFilterChange({
      tags: [],
      hasExplorations: null,
      dateRange: 'all',
    });
  };

  const sortLabels: Record<SortOption, string> = {
    newest: 'Newest First',
    oldest: 'Oldest First',
    'most-explored': 'Most Explored',
    'most-viewed': 'Most Viewed',
    'recently-updated': 'Recently Updated',
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Sort Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="bg-white/80 backdrop-blur-sm border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 rounded-full shadow-sm transition-all">
            <SortAsc className="h-4 w-4 mr-2" />
            {sortLabels[sortBy]}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 bg-white/95 backdrop-blur-sm border-2 border-gray-200 shadow-lg rounded-xl">
          <DropdownMenuLabel className="text-gray-700 font-semibold">Sort By</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value={sortBy} onValueChange={(v) => onSortChange(v as SortOption)}>
            <DropdownMenuRadioItem value="newest">Newest First</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="oldest">Oldest First</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="most-explored">Most Explored</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="most-viewed">Most Viewed</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="recently-updated">Recently Updated</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Filter Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="bg-white/80 backdrop-blur-sm border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50/50 rounded-full shadow-sm transition-all">
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2 px-2 py-0.5 text-xs bg-purple-100 text-purple-700 border border-purple-300/50 rounded-full">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 bg-white/95 backdrop-blur-sm border-2 border-gray-200 shadow-lg rounded-xl">
          <DropdownMenuLabel className="text-gray-700 font-semibold">Filter By</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {/* Exploration Status */}
          <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
            Exploration Status
          </DropdownMenuLabel>
          <DropdownMenuCheckboxItem
            checked={filters.hasExplorations === true}
            onCheckedChange={(checked) => 
              onFilterChange({ ...filters, hasExplorations: checked ? true : null })
            }
          >
            Has Explorations
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={filters.hasExplorations === false}
            onCheckedChange={(checked) => 
              onFilterChange({ ...filters, hasExplorations: checked ? false : null })
            }
          >
            No Explorations
          </DropdownMenuCheckboxItem>

          <DropdownMenuSeparator />

          {/* Date Range */}
          <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
            Date Range
          </DropdownMenuLabel>
          <DropdownMenuRadioGroup 
            value={filters.dateRange} 
            onValueChange={(v) => onFilterChange({ ...filters, dateRange: v as FilterOptions['dateRange'] })}
          >
            <DropdownMenuRadioItem value="all">All Time</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="today">Today</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="week">This Week</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="month">This Month</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="year">This Year</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>

          {availableTags.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
                Tags
              </DropdownMenuLabel>
              <div className="max-h-48 overflow-y-auto">
                {availableTags.map((tag) => (
                  <DropdownMenuCheckboxItem
                    key={tag}
                    checked={filters.tags.includes(tag)}
                    onCheckedChange={() => toggleTag(tag)}
                  >
                    {tag}
                  </DropdownMenuCheckboxItem>
                ))}
              </div>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Clear Filters */}
      {activeFiltersCount > 0 && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="hover:bg-rose-50 rounded-full">
          <X className="h-4 w-4 mr-2" />
          Clear
        </Button>
      )}

      {/* Active Filter Tags */}
      {filters.tags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {filters.tags.map((tag) => (
            <span
              key={tag}
              onClick={() => toggleTag(tag)}
              className="cursor-pointer px-3 py-1 bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 rounded-full text-xs font-medium border border-purple-300/50 hover:from-purple-200 hover:to-purple-300 transition-all shadow-sm flex items-center gap-1"
            >
              #{tag}
              <X className="h-3 w-3" />
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
