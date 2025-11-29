"use client"

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
    CheckCircle2Icon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronsLeftIcon,
    ChevronsRightIcon,
    EditIcon
} from "lucide-react"
import * as React from "react"

import { History } from "@/app/(authenticated)/history-record/types"
import { DataTableViewOptions } from "@/components/authenticated/components/data-table-view-options"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
import { HistoryRecordEditSheet } from "./history-record-edit-sheet"
import { AdvancedFilterSheet } from "@/components/authenticated/components/advanced-filter-sheet"
import { FilterCondition } from "@/app/lib/types/filter"
import { FilterIcon } from "lucide-react"
import { historyFilterableColumns } from "./filterable-columns"

// Helper function to format dates
function formatDate(date: Date | string | null): string {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('en-IN');
}

// Define columns for history table
const createColumns = (): ColumnDef<History>[] => [
    {
        id: "select",
        header: ({ table }) => (
            <div className="flex items-center justify-center">
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            </div>
        ),
        cell: ({ row }) => (
            <div className="flex items-center justify-center">
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            </div>
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "COACHNO",
        header: "Coach No",
        cell: ({ row }) => <div className="font-medium">{row.getValue("COACHNO") || '-'}</div>,
        enableHiding: false,
        meta: {
            sticky: "left",
            stickyOffset: 0,
        },
    },
    {
        accessorKey: "SR_NO",
        header: "SR No",
    },
    {
        accessorKey: "FCOACHNO",
        header: "F Coach No",
    },
    {
        accessorKey: "OCOACHNO",
        header: "O Coach No",
    },
    {
        accessorKey: "CODE",
        header: "Code",
    },
    {
        accessorKey: "TYPE",
        header: "Type",
        cell: ({ row }) => (
            <Badge variant="outline" className="whitespace-nowrap px-1.5 text-muted-foreground">
                {row.getValue("TYPE") || '-'}
            </Badge>
        ),
    },
    {
        accessorKey: "STATUS",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("STATUS") as string;
            return (
                <Badge
                    variant="outline"
                    className="flex gap-1 w-fit px-1.5 text-muted-foreground [&_svg]:size-3"
                >
                    {status === "Done" && (
                        <CheckCircle2Icon className="text-green-500 dark:text-green-400" />
                    )}
                    {status || '-'}
                </Badge>
            );
        },
    },
    {
        accessorKey: "BASEDEPOT",
        header: "Base Depot",
    },
    {
        accessorKey: "MAKE",
        header: "Make",
    },
    {
        accessorKey: "YRBLT",
        header: "Year Built",
    },
    {
        accessorKey: "MFGDT",
        header: "MFG Date",
        cell: ({ row }) => formatDate(row.getValue("MFGDT")),
    },
    {
        accessorKey: "SHOP",
        header: "Shop",
    },
    {
        accessorKey: "GEN",
        header: "Generation",
    },
    {
        accessorKey: "SPEED",
        header: "Speed",
    },
    {
        accessorKey: "ACNAC",
        header: "AC/NAC",
    },
    {
        accessorKey: "LHBNLHB",
        header: "LHB/NLHB",
    },
    {
        accessorKey: "AGE",
        header: "Age",
        cell: ({ row }) => {
            const age = row.getValue("AGE") as number | null;
            return age ? `${Number(age).toFixed(1)} yrs` : '-';
        },
    },
    {
        accessorKey: "TWEIGHT",
        header: "Weight",
        cell: ({ row }) => {
            const weight = row.getValue("TWEIGHT") as number | null;
            return weight ? `${weight} T` : '-';
        },
    },
    {
        accessorKey: "SEAT",
        header: "Seats",
    },
    {
        accessorKey: "BERTH",
        header: "Berths",
    },
    {
        accessorKey: "COST",
        header: "Cost",
        cell: ({ row }) => {
            const cost = row.getValue("COST") as number | null;
            return cost ? `₹${Number(cost).toLocaleString('en-IN')}` : '-';
        },
    },
    {
        accessorKey: "FUND",
        header: "Fund",
    },
    {
        accessorKey: "LSHOPOUTDT",
        header: "Last Shop Out",
        cell: ({ row }) => formatDate(row.getValue("LSHOPOUTDT")),
    },
    {
        accessorKey: "SHOPINDT",
        header: "Shop In Date",
        cell: ({ row }) => formatDate(row.getValue("SHOPINDT")),
    },
    {
        accessorKey: "YARDINDT",
        header: "Yard In Date",
        cell: ({ row }) => formatDate(row.getValue("YARDINDT")),
    },
    {
        accessorKey: "DT_IOH",
        header: "IOH Date",
        cell: ({ row }) => formatDate(row.getValue("DT_IOH")),
    },
    {
        accessorKey: "DUESCH",
        header: "Due Schedule",
    },
    {
        accessorKey: "POHBY",
        header: "POH By",
    },
    {
        accessorKey: "CORRSTATUS",
        header: "Corrosion Status",
    },
    { accessorKey: "REMASTER", header: "Remaster" },
    { accessorKey: "RAKESING", header: "Rake Sing" },
    { accessorKey: "ABOEM", header: "AB OEM" },
    { accessorKey: "CBC", header: "CBC" },
    { accessorKey: "CBCBY", header: "CBC By" },
    { accessorKey: "CBCOEM", header: "CBC OEM" },
    { accessorKey: "COUPLING", header: "Coupling" },
    { accessorKey: "CORRMHRS", header: "Corrosion Hours" },
    { accessorKey: "PERIOD", header: "Period" },
    { accessorKey: "LPOHBY", header: "Last POH By" },
    { accessorKey: "RETPOHDT", header: "Return POH Date", cell: ({ row }) => formatDate(row.getValue("RETPOHDT")) },
    { accessorKey: "AGE_RT_DT", header: "Age Return Date" },
    { accessorKey: "RET_DT_IOH", header: "Return IOH Date", cell: ({ row }) => formatDate(row.getValue("RET_DT_IOH")) },
    { accessorKey: "LOC", header: "Location" },
    { accessorKey: "MECHSUP", header: "Mech Sup" },
    { accessorKey: "LIFTDT", header: "Lift Date", cell: ({ row }) => formatDate(row.getValue("LIFTDT")) },
    { accessorKey: "LOWERDT", header: "Lower Date", cell: ({ row }) => formatDate(row.getValue("LOWERDT")) },
    { accessorKey: "RELIFTDT", header: "Re-Lift Date", cell: ({ row }) => formatDate(row.getValue("RELIFTDT")) },
    { accessorKey: "AIRBKDT", header: "Air Brake Date", cell: ({ row }) => formatDate(row.getValue("AIRBKDT")) },
    { accessorKey: "PTINDT", header: "PT In Date", cell: ({ row }) => formatDate(row.getValue("PTINDT")) },
    { accessorKey: "HPPTOUTDT", header: "HP PT Out Date", cell: ({ row }) => formatDate(row.getValue("HPPTOUTDT")) },
    { accessorKey: "HPPTINDT", header: "HP PT In Date", cell: ({ row }) => formatDate(row.getValue("HPPTINDT")) },
    { accessorKey: "PTOUTDT", header: "PT Out Date", cell: ({ row }) => formatDate(row.getValue("PTOUTDT")) },
    { accessorKey: "INSHOP_POS", header: "In Shop Pos" },
    { accessorKey: "TANKFITOLD", header: "Tank Fit Old" },
    { accessorKey: "TANKFITNEW", header: "Tank Fit New" },
    { accessorKey: "RMPUDT", header: "RMPU Date", cell: ({ row }) => formatDate(row.getValue("RMPUDT")) },
    { accessorKey: "BATTERYLD", header: "Battery Load" },
    { accessorKey: "FANLOAD", header: "Fan Load" },
    { accessorKey: "LIGHTLOAD", header: "Light Load" },
    { accessorKey: "UTKRISHT", header: "Utkrisht" },
    { accessorKey: "LAVUPGRADE", header: "Lav Upgrade" },
    { accessorKey: "VENTURY", header: "Ventury" },
    { accessorKey: "UPHOLSTRY", header: "Upholstery" },
    { accessorKey: "DYNO", header: "Dyno" },
    { accessorKey: "EPOXY", header: "Epoxy" },
    { accessorKey: "H_CORR", header: "H Corr" },
    { accessorKey: "H_CORR_DT", header: "H Corr Date", cell: ({ row }) => formatDate(row.getValue("H_CORR_DT")) },
    { accessorKey: "INISSUE", header: "In Issue", cell: ({ row }) => formatDate(row.getValue("INISSUE")) },
    { accessorKey: "DATE_COND", header: "Date Cond", cell: ({ row }) => formatDate(row.getValue("DATE_COND")) },
    { accessorKey: "WORKDAYS", header: "Work Days" },
    { accessorKey: "CALDAYS", header: "Cal Days" },
    { accessorKey: "DCWIFIT", header: "DC WI Fit", cell: ({ row }) => formatDate(row.getValue("DCWIFIT")) },
    { accessorKey: "ELECRACFIT", header: "Elec Rac Fit", cell: ({ row }) => formatDate(row.getValue("ELECRACFIT")) },
    { accessorKey: "NTXRFIT", header: "NTXR Fit", cell: ({ row }) => formatDate(row.getValue("NTXRFIT")) },
    { accessorKey: "ISSUEDT", header: "Issue Date", cell: ({ row }) => formatDate(row.getValue("ISSUEDT")) },
    { accessorKey: "COND_POS", header: "Cond Pos" },
    { accessorKey: "COND_BY", header: "Cond By" },
    { accessorKey: "SERVICE", header: "Service" },
    { accessorKey: "RSP", header: "RSP" },
    { accessorKey: "C_R", header: "C R", cell: ({ row }) => formatDate(row.getValue("C_R")) },
    { accessorKey: "OTHER_3", header: "Other 3" },
    { accessorKey: "MEMO", header: "Memo" },
    { accessorKey: "CTYPE", header: "C Type" },
    { accessorKey: "ROAMSDT", header: "Roams Date", cell: ({ row }) => formatDate(row.getValue("ROAMSDT")) },
    { accessorKey: "ACME", header: "ACME", cell: ({ row }) => formatDate(row.getValue("ACME")) },
    { accessorKey: "INSP_DT", header: "Insp Date", cell: ({ row }) => formatDate(row.getValue("INSP_DT")) },
    { accessorKey: "ROAMSOUTDT", header: "Roams Out Date", cell: ({ row }) => formatDate(row.getValue("ROAMSOUTDT")) },
    {
        accessorKey: "REMARK",
        header: "Remark",
        cell: ({ row }) => {
            const remark = row.getValue("REMARK") as string | null;
            return (
                <div className="max-w-[200px] truncate" title={remark || ''}>
                    {remark || '-'}
                </div>
            );
        },
    },
]

interface DataTableProps {
    data: History[];
    pageCount: number;
    pageIndex: number;
    pageSize: number;
    total: number;
    onPaginationChange: React.Dispatch<React.SetStateAction<PaginationState>>
    isLoading?: boolean;
    searchQuery: string;
    onSearchChange: (value: string) => void;
    advancedFilters: FilterCondition[];
    onAdvancedFiltersChange: (filters: FilterCondition[]) => void;
}

export function HistoryRecordDataTable({
    data,
    pageCount,
    pageIndex,
    pageSize,
    total,
    onPaginationChange,
    isLoading = false,
    searchQuery,
    onSearchChange,
    advancedFilters,
    onAdvancedFiltersChange,
}: DataTableProps) {
    const [rowSelection, setRowSelection] = React.useState({})
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({
        // Hide most columns by default
        SR_NO: false,
        FCOACHNO: false,
        OCOACHNO: false,
        CODE: false,
        MFGDT: false,
        FUND: false,
        SEAT: false,
        BERTH: false,
        COST: false,
        YARDINDT: false,
        SHOPINDT: false,
        DT_IOH: false,
        DUESCH: false,
        POHBY: false,
        CORRSTATUS: false,
        REMARK: false,
        REMASTER: false,
        RAKESING: false,
        ABOEM: false,
        CBC: false,
        CBCBY: false,
        CBCOEM: false,
        COUPLING: false,
        CORRMHRS: false,
        PERIOD: false,
        LPOHBY: false,
        RETPOHDT: false,
        AGE_RT_DT: false,
        RET_DT_IOH: false,
        LOC: false,
        MECHSUP: false,
        LIFTDT: false,
        LOWERDT: false,
        RELIFTDT: false,
        AIRBKDT: false,
        PTINDT: false,
        HPPTOUTDT: false,
        HPPTINDT: false,
        PTOUTDT: false,
        INSHOP_POS: false,
        TANKFITOLD: false,
        TANKFITNEW: false,
        RMPUDT: false,
        BATTERYLD: false,
        FANLOAD: false,
        LIGHTLOAD: false,
        UTKRISHT: false,
        LAVUPGRADE: false,
        VENTURY: false,
        UPHOLSTRY: false,
        DYNO: false,
        EPOXY: false,
        H_CORR: false,
        H_CORR_DT: false,
        INISSUE: false,
        DATE_COND: false,
        WORKDAYS: false,
        CALDAYS: false,
        DCWIFIT: false,
        ELECRACFIT: false,
        NTXRFIT: false,
        ISSUEDT: false,
        COND_POS: false,
        COND_BY: false,
        SERVICE: false,
        RSP: false,
        C_R: false,
        OTHER_3: false,
        MEMO: false,
        CTYPE: false,
        ROAMSDT: false,
        ACME: false,
        INSP_DT: false,
        ROAMSOUTDT: false,
    })
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [sorting, setSorting] = React.useState<SortingState>([])

    // Edit Sheet State
    const [editingHistory, setEditingHistory] = React.useState<History | null>(null)
    const [isEditSheetOpen, setIsEditSheetOpen] = React.useState(false)

    // Filter Sheet State
    const [isFilterSheetOpen, setIsFilterSheetOpen] = React.useState(false)

    const handleEdit = (history: History) => {
        setEditingHistory(history)
        setIsEditSheetOpen(true)
    }

    const columns = React.useMemo(() => {
        const cols = createColumns();
        // Add Actions column
        cols.push({
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(row.original)}
                    className="h-8 w-8 p-0"
                >
                    <span className="sr-only">Edit</span>
                    <EditIcon className="h-4 w-4" />
                </Button>
            ),
            enableHiding: false,
            meta: {
                sticky: "right",
                stickyOffset: 0,
            },
        });
        return cols;
    }, [])

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
            {/* Toolbar */}
            <div className="flex flex-col items-center justify-between gap-3 md:flex-row">
                <Input
                    placeholder="Search coach number..."
                    value={searchQuery}
                    onChange={(event) => onSearchChange(event.target.value)}
                    className="h-9 max-w-sm"
                />

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsFilterSheetOpen(true)}
                        className="h-9"
                    >
                        <FilterIcon className="mr-2 h-4 w-4" />
                        Filters
                        {advancedFilters.length > 0 && (
                            <Badge variant="secondary" className="ml-2 rounded-sm px-1 font-normal">
                                {advancedFilters.length}
                            </Badge>
                        )}
                    </Button>
                    <DataTableViewOptions table={table} />
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto overflow-hidden rounded-lg border">
                <Table>
                    <TableHeader className="sticky top-0 z-10 bg-muted">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    const meta = header.column.columnDef.meta as any;
                                    const isSticky = meta?.sticky;
                                    const stickyClasses = isSticky === "left"
                                        ? "sticky left-0 z-20 bg-muted"
                                        : isSticky === "right"
                                            ? "sticky right-0 z-20 bg-muted"
                                            : "";

                                    return (
                                        <TableHead
                                            key={header.id}
                                            className={`whitespace-nowrap ${stickyClasses}`}
                                        >
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
                                    {row.getVisibleCells().map((cell) => {
                                        const meta = cell.column.columnDef.meta as any;
                                        const isSticky = meta?.sticky;
                                        const stickyClasses = isSticky === "left"
                                            ? "sticky left-0 z-10 bg-background"
                                            : isSticky === "right"
                                                ? "sticky right-0 z-10 bg-background"
                                                : "";

                                        return (
                                            <TableCell
                                                key={cell.id}
                                                className={`whitespace-nowrap ${stickyClasses}`}
                                            >
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </TableCell>
                                        );
                                    })}
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

            {/* Pagination */}
            <div className="flex items-center justify-between px-4">
                <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
                    {table.getFilteredSelectedRowModel().rows.length} of{" "}
                    {total} row(s) selected.
                </div>
                <div className="flex w-full items-center gap-8 lg:w-fit">
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
                            <SelectTrigger className="w-20">
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
                            <ChevronsLeftIcon />
                        </Button>
                        <Button
                            variant="outline"
                            className="size-8"
                            size="icon"
                            onClick={() => onPaginationChange({ pageIndex: pageIndex - 1, pageSize })}
                            disabled={pageIndex === 0}
                        >
                            <span className="sr-only">Go to previous page</span>
                            <ChevronLeftIcon />
                        </Button>
                        <Button
                            variant="outline"
                            className="size-8"
                            size="icon"
                            onClick={() => onPaginationChange({ pageIndex: pageIndex + 1, pageSize })}
                            disabled={pageIndex >= pageCount - 1}
                        >
                            <span className="sr-only">Go to next page</span>
                            <ChevronRightIcon />
                        </Button>
                        <Button
                            variant="outline"
                            className="hidden size-8 lg:flex"
                            size="icon"
                            onClick={() => onPaginationChange({ pageIndex: pageCount - 1, pageSize })}
                            disabled={pageIndex >= pageCount - 1}
                        >
                            <span className="sr-only">Go to last page</span>
                            <ChevronsRightIcon />
                        </Button>
                    </div>
                </div>
            </div>

            <HistoryRecordEditSheet
                open={isEditSheetOpen}
                onOpenChange={setIsEditSheetOpen}
                history={editingHistory}
            />

            <AdvancedFilterSheet
                open={isFilterSheetOpen}
                onOpenChange={setIsFilterSheetOpen}
                columns={historyFilterableColumns}
                onApplyFilters={onAdvancedFiltersChange}
                initialConditions={advancedFilters}
            />
        </div>
    )
}
