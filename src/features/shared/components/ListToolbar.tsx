import { useState } from "react";
import { Search, SlidersHorizontal, ArrowUpDown, X, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface SortOption {
  id: string;
  label: string;
}

export interface FilterOption {
  id: string;
  label: string;
  group?: string;
}

interface ListToolbarProps {
  /** Search placeholder text */
  searchPlaceholder?: string;
  /** Current search value */
  searchValue: string;
  /** Search change handler */
  onSearchChange: (value: string) => void;
  /** Available sort options */
  sortOptions?: SortOption[];
  /** Current sort selection */
  currentSort?: string;
  /** Sort change handler */
  onSortChange?: (sortId: string) => void;
  /** Sort direction */
  sortDirection?: "asc" | "desc";
  /** Toggle sort direction */
  onSortDirectionChange?: () => void;
  /** Available filter options */
  filterOptions?: FilterOption[];
  /** Currently active filters */
  activeFilters?: string[];
  /** Filter change handler */
  onFilterChange?: (filterId: string) => void;
  /** Clear all filters */
  onClearFilters?: () => void;
}

export function ListToolbar({
  searchPlaceholder = "Search...",
  searchValue,
  onSearchChange,
  sortOptions = [],
  currentSort,
  onSortChange,
  sortDirection = "asc",
  onSortDirectionChange,
  filterOptions = [],
  activeFilters = [],
  onFilterChange,
  onClearFilters,
}: ListToolbarProps) {
  const [showSearch, setShowSearch] = useState(false);

  const hasFilters = filterOptions.length > 0;
  const hasSort = sortOptions.length > 0;
  const activeFilterCount = activeFilters.length;

  // Group filters by their group property
  const groupedFilters = filterOptions.reduce((acc, filter) => {
    const group = filter.group || "Other";
    if (!acc[group]) acc[group] = [];
    acc[group].push(filter);
    return acc;
  }, {} as Record<string, FilterOption[]>);

  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-background/50">
      {/* Search */}
      {showSearch ? (
        <div className="flex-1 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="pl-9 h-9"
              autoFocus
            />
            {searchValue && (
              <Button
                variant="ghost"
                size="icon-sm"
                className="absolute right-1 top-1/2 -translate-y-1/2"
                onClick={() => onSearchChange("")}
              >
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setShowSearch(false);
              onSearchChange("");
            }}
          >
            Cancel
          </Button>
        </div>
      ) : (
        <>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setShowSearch(true)}
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </Button>

          <div className="flex-1" />

          {/* Sort */}
          {hasSort && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1.5">
                  <ArrowUpDown className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-xs">Sort</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                {sortOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.id}
                    onClick={() => onSortChange?.(option.id)}
                    className="justify-between"
                  >
                    {option.label}
                    {currentSort === option.id && (
                      <Check className="w-4 h-4 text-primary" />
                    )}
                  </DropdownMenuItem>
                ))}
                {onSortDirectionChange && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onSortDirectionChange}>
                      {sortDirection === "asc" ? "↑ Ascending" : "↓ Descending"}
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Filter */}
          {hasFilters && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1.5 relative">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-xs">Filter</span>
                  {activeFilterCount > 0 && (
                    <Badge
                      variant="default"
                      className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
                    >
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {Object.entries(groupedFilters).map(([group, filters], idx) => (
                  <div key={group}>
                    {idx > 0 && <DropdownMenuSeparator />}
                    <DropdownMenuLabel>{group}</DropdownMenuLabel>
                    {filters.map((filter) => (
                      <DropdownMenuItem
                        key={filter.id}
                        onClick={() => onFilterChange?.(filter.id)}
                        className="justify-between"
                      >
                        {filter.label}
                        {activeFilters.includes(filter.id) && (
                          <Check className="w-4 h-4 text-primary" />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </div>
                ))}
                {activeFilterCount > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={onClearFilters}
                      className="text-destructive"
                    >
                      Clear all filters
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </>
      )}
    </div>
  );
}
