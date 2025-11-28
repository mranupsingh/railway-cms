"use client"

import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu"
import { Table } from "@tanstack/react-table"
import { ChevronDownIcon, ColumnsIcon, SearchIcon } from "lucide-react"
import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

interface DataTableViewOptionsProps<TData> {
    table: Table<TData>
}

export function DataTableViewOptions<TData>({
    table,
}: DataTableViewOptionsProps<TData>) {
    const [search, setSearch] = useState("")

    const columns = table.getAllColumns().filter(
        (column) =>
            typeof column.accessorFn !== "undefined" && column.getCanHide()
    )

    const filteredColumns = useMemo(() => {
        return columns.filter((column) =>
            column.id.toLowerCase().includes(search.toLowerCase())
        )
    }, [columns, search])

    const isAllVisible = filteredColumns.every((column) => column.getIsVisible())
    const isSomeVisible = filteredColumns.some((column) => column.getIsVisible())

    const toggleAll = (checked: boolean) => {
        filteredColumns.forEach((column) => column.toggleVisibility(checked))
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="w-full max-w-96 h-8 md:w-fit lg:flex"
                >
                    <ColumnsIcon className="mr-2 size-4" />
                    View
                    <ChevronDownIcon className="ml-2 size-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[280px]">
                <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                <div className="flex items-center px-2 pb-2">
                    <SearchIcon className="mr-2 size-4 text-muted-foreground" />
                    <Input
                        placeholder="Search columns..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="h-8"
                    />
                </div>
                <DropdownMenuSeparator />
                <div className="flex items-center space-x-2 p-2">
                    <Checkbox
                        checked={isAllVisible ? true : isSomeVisible ? "indeterminate" : false}
                        onCheckedChange={(checked) => toggleAll(!!checked)}
                        id="select-all-columns"
                    />
                    <label
                        htmlFor="select-all-columns"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        Select All
                    </label>
                </div>
                <DropdownMenuSeparator />
                <ScrollArea className="h-[300px]">
                    {filteredColumns.length > 0 ? (
                        filteredColumns.map((column) => {
                            return (
                                <DropdownMenuCheckboxItem
                                    key={column.id}
                                    className="capitalize"
                                    checked={column.getIsVisible()}
                                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                                    onSelect={(e) => e.preventDefault()}
                                >
                                    {column.id.replace(/_/g, " ")}
                                </DropdownMenuCheckboxItem>
                            )
                        })
                    ) : (
                        <div className="p-2 text-center text-sm text-muted-foreground">
                            No columns found
                        </div>
                    )}
                </ScrollArea>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
