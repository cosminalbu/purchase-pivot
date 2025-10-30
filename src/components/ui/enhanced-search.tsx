import { useState, useEffect, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Filter, Calendar as CalendarIcon, Search } from "lucide-react"
import { format } from "date-fns"

interface FilterOption {
  key: string
  label: string
  type: 'select' | 'date' | 'dateRange'
  options?: { value: string; label: string }[]
}

interface ActiveFilter {
  key: string
  label: string
  value: string | { from: Date; to: Date }
  displayValue: string
}

interface EnhancedSearchProps {
  placeholder?: string
  searchValue: string
  onSearchChange: (value: string) => void
  filters?: FilterOption[]
  activeFilters?: ActiveFilter[]
  onFilterChange?: (filters: ActiveFilter[]) => void
  debounceMs?: number
}

export function EnhancedSearch({
  placeholder = "Search...",
  searchValue,
  onSearchChange,
  filters = [],
  activeFilters = [],
  onFilterChange,
  debounceMs = 300
}: EnhancedSearchProps) {
  const [debouncedValue, setDebouncedValue] = useState(searchValue)

  // Sync local state with prop changes
  useEffect(() => {
    setDebouncedValue(searchValue)
  }, [searchValue])

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(debouncedValue)
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [debouncedValue, onSearchChange, debounceMs])

  const handleSearchInputChange = useCallback((value: string) => {
    setDebouncedValue(value)
  }, [])

  const removeFilter = useCallback((filterKey: string) => {
    if (onFilterChange) {
      const updated = activeFilters.filter(filter => filter.key !== filterKey)
      onFilterChange(updated)
    }
  }, [activeFilters, onFilterChange])

  const clearAllFilters = useCallback(() => {
    if (onFilterChange) {
      onFilterChange([])
    }
  }, [onFilterChange])

  const addFilter = useCallback((filter: FilterOption, value: string | { from: Date; to: Date }) => {
    if (onFilterChange) {
      const displayValue = typeof value === 'string' 
        ? value 
        : `${format(value.from, 'MMM dd')} - ${format(value.to, 'MMM dd')}`
      
      const newFilter: ActiveFilter = {
        key: filter.key,
        label: filter.label,
        value,
        displayValue
      }

      const updated = activeFilters.filter(f => f.key !== filter.key)
      updated.push(newFilter)
      onFilterChange(updated)
    }
  }, [activeFilters, onFilterChange])

  return (
    <div className="space-y-3">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          value={debouncedValue}
          onChange={(e) => handleSearchInputChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filter Controls */}
      {filters.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                Add Filter
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4">
              <div className="space-y-4">
                {filters.map((filter) => (
                  <div key={filter.key}>
                    <label className="text-sm font-medium">{filter.label}</label>
                    {filter.type === 'select' && filter.options && (
                      <Select onValueChange={(value) => addFilter(filter, value)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder={`Select ${filter.label}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {filter.options.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    {filter.type === 'date' && (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full mt-1">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            Pick a date
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            onSelect={(date) => {
                              if (date) {
                                addFilter(filter, format(date, 'yyyy-MM-dd'))
                              }
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    )}
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Active Filters */}
          {activeFilters.map((filter) => (
            <Badge
              key={filter.key}
              variant="secondary"
              className="gap-1 pr-1"
            >
              {filter.label}: {filter.displayValue}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => removeFilter(filter.key)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}

          {/* Clear All */}
          {activeFilters.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-muted-foreground hover:text-destructive"
            >
              Clear all
            </Button>
          )}
        </div>
      )}

      {/* Filter Count */}
      {activeFilters.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {activeFilters.length} filter{activeFilters.length !== 1 ? 's' : ''} applied
        </p>
      )}
    </div>
  )
}