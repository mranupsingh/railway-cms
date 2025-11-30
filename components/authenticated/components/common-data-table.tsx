"use client"

import * as React from "react"
import {
    ColumnDef,
    ColumnFiltersState,
    PaginationState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronsLeftIcon,
    ChevronsRightIcon,
    FilterIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataTableViewOptions } from "@/components/authenticated/components/data-table-view-options"

interface CommonDataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    pageCount: number
    pageIndex: number
    pageSize: number
    total: number
    onPaginationChange: React.Dispatch<React.SetStateAction<PaginationState>>
    isLoading?: boolean
    searchQuery?: string
    onSearchChange?: (value: string) => void
    onFilterClick?: () => void
    activeFiltersCount?: number
    tabs?: {
        value: string
        label: string
        count?: number
    }[]
    activeTab?: string
    onTabChange?: (value: string) => void
}

export function CommonDataTable<TData, TValue>({
    columns,
    data,
    pageCount,
    pageIndex,
    pageSize,
    total,
    onPaginationChange,
    isLoading = false,
    searchQuery = "",
    onSearchChange,
    onFilterClick,
    activeFiltersCount = 0,
    tabs,
    activeTab,
    onTabChange,
}: CommonDataTableProps<TData, TValue>) {
    const [rowSelection, setRowSelection] = React.useState({})
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [sorting, setSorting] = React.useState<SortingState>([])

    const table = useReactTable({
        data,
        columns,
        pageCount,
        state: {
            sorting,
            columnVisibility,
            rowSelection,
            columnFilters,
            pagination: {
                pageIndex,
                pageSize,
            },
        },
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onPaginationChange,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        manualPagination: true,
        manualSorting: false,
        manualFiltering: true,
    })

    return (
        <div className="space-y-4">
            {tabs && onTabChange && (
                <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
                    <TabsList>
                        {tabs.map((tab) => (
                            <TabsTrigger key={tab.value} value={tab.value} className="gap-2">
                                {tab.label}
                                {tab.count !== undefined && (
                                    <Badge variant="secondary" className="rounded-full px-2 py-0.5 text-xs">
                                        {tab.count}
                                    </Badge>
                                )}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
            )}

            <div className="flex flex-col items-center justify-between gap-3 md:flex-row">
                {onSearchChange && (
                    <Input
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(event) => onSearchChange(event.target.value)}
                        className="h-9 max-w-sm"
                    />
                )}

                <div className="flex items-center gap-2 ml-auto">
                    {onFilterClick && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onFilterClick}
                            className="h-9"
                        >
                            <FilterIcon className="mr-2 h-4 w-4" />
                            Filters
                            {activeFiltersCount > 0 && (
                                <Badge variant="secondary" className="ml-2 rounded-sm px-1 font-normal">
                                    {activeFiltersCount}
                                </Badge>
                            )}
                        </Button>
                    )}

                    <DataTableViewOptions table={table} />
                </div>
            </div>

            <div className="overflow-x-auto overflow-hidden rounded-lg border">
                <Table>
                    <TableHeader className="sticky top-0 z-10 bg-muted">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id} className="whitespace-nowrap">
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="whitespace-nowrap">
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between px-2">
                <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
                    {table.getFilteredSelectedRowModel().rows.length} of{" "}
                    {total} row(s) selected.
                </div>
                <div className="flex w-full items-center gap-4 lg:w-fit">
                    <div className="hidden items-center gap-2 lg:flex">
                        <p className="text-sm font-medium">Rows per page</p>
                        <Select
                            value={`${pageSize}`}
                            onValueChange={(value) => {
                                onPaginationChange({
                                    pageIndex: 0,
                                    pageSize: Number(value),
                                })
                            }}
                        >
                            <SelectTrigger className="w-16 h-8">
                                <SelectValue placeholder={pageSize} />
                            </SelectTrigger>
                            <SelectContent side="top">
                                {[10, 20, 30, 40, 50, 100].map((size) => (
                                    <SelectItem key={size} value={`${size}`}>
                                        {size}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex w-fit items-center justify-center text-sm font-medium">
                        Page {pageIndex + 1} of {pageCount}
                    </div>
                    <div className="ml-auto flex items-center gap-2 lg:ml-0">
                        <Button
                            variant="outline"
                            className="hidden h-8 w-8 p-0 lg:flex"
                            onClick={() => onPaginationChange({ pageIndex: 0, pageSize })}
                            disabled={pageIndex === 0}
                        >
                            <span className="sr-only">Go to first page</span>
                            <ChevronsLeftIcon className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => onPaginationChange({ pageIndex: pageIndex - 1, pageSize })}
                            disabled={pageIndex === 0}
                        >
                            <span className="sr-only">Go to previous page</span>
                            <ChevronLeftIcon className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => onPaginationChange({ pageIndex: pageIndex + 1, pageSize })}
                            disabled={pageIndex >= pageCount - 1}
                        >
                            <span className="sr-only">Go to next page</span>
                            <ChevronRightIcon className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="hidden h-8 w-8 p-0 lg:flex"
                            onClick={() => onPaginationChange({ pageIndex: pageCount - 1, pageSize })}
                            disabled={pageIndex >= pageCount - 1}
                        >
                            <span className="sr-only">Go to last page</span>
                            <ChevronsRightIcon className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
