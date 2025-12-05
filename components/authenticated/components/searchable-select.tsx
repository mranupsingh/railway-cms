"use client"

import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Check, ChevronsUpDown, X } from "lucide-react"
import * as React from "react"
import { Badge } from "@/components/ui/badge"

export interface SearchableSelectOption {
    value: string
    label: string
    original?: any
}

interface SearchableSelectProps {
    options: SearchableSelectOption[]
    value: string | string[]
    onValueChange: (value: any) => void
    placeholder?: string
    searchPlaceholder?: string
    emptyText?: string
    className?: string
    disabled?: boolean
    onSearch?: (term: string) => void
    onLoadMore?: () => void
    hasMore?: boolean
    isLoading?: boolean
    multiple?: boolean
}

export function SearchableSelect({
    options,
    value,
    onValueChange,
    placeholder = "Select...",
    searchPlaceholder = "Search...",
    emptyText = "No option found.",
    className,
    disabled = false,
    onSearch,
    onLoadMore,
    hasMore,
    isLoading,
    multiple = false,
}: SearchableSelectProps) {
    const [open, setOpen] = React.useState(false)
    const [query, setQuery] = React.useState("")

    // Filter options locally if onSearch is not provided
    const filteredOptions = React.useMemo(() => {
        if (onSearch) return options
        if (!query.trim()) return options
        const lowerQuery = query.toLowerCase()
        return options.filter(option =>
            option.label.toLowerCase().includes(lowerQuery) ||
            option.value.toLowerCase().includes(lowerQuery)
        )
    }, [options, query, onSearch])

    // Handle search input change
    const handleSearch = (val: string) => {
        setQuery(val)
        if (onSearch) {
            onSearch(val)
        }
    }

    // Reset query when popover closes
    React.useEffect(() => {
        if (!open) {
            setQuery("")
            if (onSearch) onSearch("")
        }
    }, [open, onSearch])

    // Get selected labels
    const selectedLabels = React.useMemo(() => {
        if (multiple && Array.isArray(value)) {
            return options
                .filter(opt => value.includes(opt.value))
                .map(opt => opt.label)
        }
        return options.find(opt => opt.value === value)?.label
    }, [options, value, multiple])

    const handleSelect = (currentValue: string) => {
        if (multiple && Array.isArray(value)) {
            const newValue = value.includes(currentValue)
                ? value.filter((v) => v !== currentValue)
                : [...value, currentValue]
            onValueChange(newValue)
        } else {
            onValueChange(currentValue)
            setOpen(false)
        }
    }

    const handleRemove = (e: React.MouseEvent, valToRemove: string) => {
        e.stopPropagation()
        if (multiple && Array.isArray(value)) {
            onValueChange(value.filter(v => v !== valToRemove))
        }
    }

    return (
        <Popover open={open} onOpenChange={setOpen} modal={true}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    disabled={disabled}
                    className={cn("w-full justify-between h-auto min-h-10", className)}
                >
                    <div className="flex flex-wrap gap-1 items-center">
                        {multiple && Array.isArray(value) && value.length > 0 ? (
                            value.map((val) => {
                                const option = options.find((o) => o.value === val)
                                return (
                                    <Badge key={val} variant="secondary" className="mr-1">
                                        {option?.label || val}
                                        <div
                                            className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
                                            onClick={(e) => handleRemove(e, val)}
                                        >
                                            <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                        </div>
                                    </Badge>
                                )
                            })
                        ) : (
                            <span className="truncate">
                                {multiple
                                    ? (Array.isArray(value) && value.length === 0 ? placeholder : "")
                                    : (selectedLabels || placeholder)}
                            </span>
                        )}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-[300px] p-0"
                align="start"
                onOpenAutoFocus={(e) => e.preventDefault()}
            >
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder={searchPlaceholder}
                        value={query}
                        onValueChange={handleSearch}
                    />
                    <div
                        className="overflow-y-auto"
                        style={{ maxHeight: '300px' }}
                        onScroll={(e) => {
                            const target = e.currentTarget
                            if (
                                target.scrollHeight - target.scrollTop === target.clientHeight &&
                                hasMore &&
                                onLoadMore &&
                                !isLoading
                            ) {
                                onLoadMore()
                            }
                        }}
                    >
                        {filteredOptions.length === 0 && !isLoading ? (
                            <CommandEmpty>{emptyText}</CommandEmpty>
                        ) : (
                            <CommandGroup>
                                {filteredOptions.map((option) => {
                                    const isSelected = multiple && Array.isArray(value)
                                        ? value.includes(option.value)
                                        : value === option.value

                                    return (
                                        <CommandItem
                                            key={option.value}
                                            value={option.label}
                                            onSelect={() => handleSelect(option.value)}
                                            className="cursor-pointer"
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    isSelected
                                                        ? "opacity-100"
                                                        : "opacity-0"
                                                )}
                                            />
                                            {option.label}
                                        </CommandItem>
                                    )
                                })}
                                {isLoading && (
                                    <div className="p-2 text-center text-sm text-muted-foreground">
                                        Loading more...
                                    </div>
                                )}
                            </CommandGroup>
                        )}
                    </div>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
