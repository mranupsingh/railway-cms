"use client"

import { useVirtualizer } from "@tanstack/react-virtual"
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"
import * as React from "react"

import { Button } from "@/components/ui/button"
import {
    Command,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export interface Option {
    value: string
    label: string
    [key: string]: any
}

interface SearchableSelectProps {
    value?: string
    onValueChange: (value: string) => void
    options: Option[]
    placeholder?: string
    searchPlaceholder?: string
    emptyMessage?: string
    isLoading?: boolean
    onSearch?: (term: string) => void
    onLoadMore?: () => void
    hasMore?: boolean
    disabled?: boolean
    className?: string
}

export function SearchableSelect({
    value,
    onValueChange,
    options,
    placeholder = "Select...",
    searchPlaceholder = "Search...",
    emptyMessage = "No results found.",
    isLoading = false,
    onSearch,
    onLoadMore,
    hasMore = false,
    disabled = false,
    className,
}: SearchableSelectProps) {
    const [open, setOpen] = React.useState(false)
    const [searchValue, setSearchValue] = React.useState("")

    // Handle search debouncing if onSearch is provided (server-side)
    React.useEffect(() => {
        if (onSearch) {
            const timer = setTimeout(() => {
                onSearch(searchValue)
            }, 300)
            return () => clearTimeout(timer)
        }
    }, [searchValue, onSearch])

    // Client-side filtering if onSearch is NOT provided
    const filteredOptions = React.useMemo(() => {
        if (onSearch) return options; // Server-side search handles filtering
        if (!searchValue) return options;
        return options.filter(option =>
            option.label.toLowerCase().includes(searchValue.toLowerCase())
        );
    }, [options, searchValue, onSearch]);

    const parentRef = React.useRef<HTMLDivElement>(null)

    // Only use virtualization if we have many items (e.g., > 50)
    const enableVirtualization = filteredOptions.length > 50;

    const rowVirtualizer = useVirtualizer({
        count: filteredOptions.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 32, // Estimate row height
        overscan: 5,
        enabled: enableVirtualization
    })

    // Handle infinite scroll
    React.useEffect(() => {
        if (!enableVirtualization) return;

        const [lastItem] = [...rowVirtualizer.getVirtualItems()].reverse()

        if (!lastItem) {
            return
        }

        if (
            lastItem.index >= filteredOptions.length - 1 &&
            hasMore &&
            !isLoading &&
            onLoadMore
        ) {
            onLoadMore()
        }
    }, [
        hasMore,
        isLoading,
        onLoadMore,
        filteredOptions.length,
        rowVirtualizer.getVirtualItems(),
        enableVirtualization
    ])

    const selectedLabel = React.useMemo(() => {
        return options.find((opt) => opt.value === value)?.label || value
    }, [options, value])

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full justify-between", className)}
                    disabled={disabled}
                >
                    {value ? selectedLabel : placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder={searchPlaceholder}
                        value={searchValue}
                        onValueChange={setSearchValue}
                    />
                    <CommandList
                        ref={parentRef}
                        className="max-h-[300px] overflow-y-auto"
                    >
                        {filteredOptions.length === 0 && !isLoading ? (
                            <div className="py-6 text-center text-sm">{emptyMessage}</div>
                        ) : (
                            enableVirtualization ? (
                                <div
                                    style={{
                                        height: `${rowVirtualizer.getTotalSize()}px`,
                                        width: '100%',
                                        position: 'relative',
                                    }}
                                >
                                    {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                                        const option = filteredOptions[virtualRow.index]
                                        return (
                                            <CommandItem
                                                key={option.value}
                                                value={option.label}
                                                onSelect={() => {
                                                    onValueChange(option.value)
                                                    setOpen(false)
                                                }}
                                                style={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    width: '100%',
                                                    height: `${virtualRow.size}px`,
                                                    transform: `translateY(${virtualRow.start}px)`,
                                                }}
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        value === option.value ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                {option.label}
                                            </CommandItem>
                                        )
                                    })}
                                </div>
                            ) : (
                                <CommandGroup>
                                    {filteredOptions.map((option) => (
                                        <CommandItem
                                            key={option.value}
                                            value={option.label}
                                            onSelect={() => {
                                                onValueChange(option.value)
                                                setOpen(false)
                                            }}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    value === option.value ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            {option.label}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            )
                        )}

                        {isLoading && (
                            <div className="flex justify-center p-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                            </div>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
