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

import { CoachMaster } from "@/app/(authenticated)/master-record/types"
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
import { MasterRecordEditSheet } from "./master-record-edit-sheet"
import { AdvancedFilterSheet } from "@/components/authenticated/components/advanced-filter-sheet"
import { FilterCondition } from "@/app/lib/types/filter"
import { FilterIcon } from "lucide-react"
import { masterFilterableColumns } from "./filterable-columns"

// Helper function to format dates
function formatDate(date: Date | string | null): string {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('en-IN');
}

// Define all columns
const createColumns = (): ColumnDef<CoachMaster>[] => [
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
        accessorKey: "coachno",
        header: "Coach No",
        cell: ({ row }) => <div className="font-medium">{row.getValue("coachno")}</div>,
        enableHiding: false,
        meta: {
            sticky: "left",
            stickyOffset: 0,
        },
    },
    {
        accessorKey: "fcoachno",
        header: "F Coach No",
    },
    {
        accessorKey: "ocoachno",
        header: "O Coach No",
    },
    {
        accessorKey: "code",
        header: "Code",
    },
    {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => (
            <Badge variant="outline" className="whitespace-nowrap px-1.5 text-muted-foreground">
                {row.getValue("type") || '-'}
            </Badge>
        ),
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
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
        accessorKey: "basedepot",
        header: "Base Depot",
    },
    {
        accessorKey: "make",
        header: "Make",
    },
    {
        accessorKey: "yrblt",
        header: "Year Built",
    },
    {
        accessorKey: "mfgdt",
        header: "MFG Date",
        cell: ({ row }) => formatDate(row.getValue("mfgdt")),
    },
    {
        accessorKey: "shop",
        header: "Shop",
    },
    {
        accessorKey: "gen",
        header: "Generation",
    },
    {
        accessorKey: "speed",
        header: "Speed",
    },
    {
        accessorKey: "acnac",
        header: "AC/NAC",
    },
    {
        accessorKey: "lhbnlhb",
        header: "LHB/NLHB",
    },
    {
        accessorKey: "age",
        header: "Age",
        cell: ({ row }) => {
            const age = row.getValue("age") as number | null;
            return age ? `${age.toFixed(1)} yrs` : '-';
        },
    },
    {
        accessorKey: "tweight",
        header: "Weight",
        cell: ({ row }) => {
            const weight = row.getValue("tweight") as number | null;
            return weight ? `${weight} T` : '-';
        },
    },
    {
        accessorKey: "seat",
        header: "Seats",
    },
    {
        accessorKey: "berth",
        header: "Berths",
    },
    {
        accessorKey: "cost",
        header: "Cost",
        cell: ({ row }) => {
            const cost = row.getValue("cost") as number | null;
            return cost ? `₹${cost.toLocaleString('en-IN')}` : '-';
        },
    },
    {
        accessorKey: "fund",
        header: "Fund",
    },
    {
        accessorKey: "lshopoutdt",
        header: "Last Shop Out",
        cell: ({ row }) => formatDate(row.getValue("lshopoutdt")),
    },
    {
        accessorKey: "shopindt",
        header: "Shop In Date",
        cell: ({ row }) => formatDate(row.getValue("shopindt")),
    },
    {
        accessorKey: "yardindt",
        header: "Yard In Date",
        cell: ({ row }) => formatDate(row.getValue("yardindt")),
    },
    {
        accessorKey: "dt_ioh",
        header: "IOH Date",
        cell: ({ row }) => formatDate(row.getValue("dt_ioh")),
    },
    {
        accessorKey: "duesch",
        header: "Due Schedule",
    },
    {
        accessorKey: "pohby",
        header: "POH By",
    },
    {
        accessorKey: "corrstatus",
        header: "Corrosion Status",
    },
    { accessorKey: "re_placed", header: "Re Placed" },
    { accessorKey: "dt_placed", header: "Date Placed", cell: ({ row }) => formatDate(row.getValue("dt_placed")) },
    { accessorKey: "comdt", header: "Com Date", cell: ({ row }) => formatDate(row.getValue("comdt")) },
    { accessorKey: "remaster", header: "Remaster" },
    { accessorKey: "books", header: "Books" },
    { accessorKey: "rakesing", header: "Rake Sing" },
    { accessorKey: "overagedt", header: "Overage Date", cell: ({ row }) => formatDate(row.getValue("overagedt")) },
    { accessorKey: "aboem", header: "AB OEM" },
    { accessorKey: "bktype", header: "Brake Type" },
    { accessorKey: "cbc", header: "CBC" },
    { accessorKey: "cbcby", header: "CBC By" },
    { accessorKey: "cbcoem", header: "CBC OEM" },
    { accessorKey: "coupling", header: "Coupling" },
    { accessorKey: "corrmhrs", header: "Corrosion Hours" },
    { accessorKey: "period", header: "Period" },
    { accessorKey: "lpohby", header: "Last POH By" },
    { accessorKey: "retpohdt", header: "Return POH Date", cell: ({ row }) => formatDate(row.getValue("retpohdt")) },
    { accessorKey: "age_rt_dt", header: "Age Return Date" },
    { accessorKey: "ret_dt_ioh", header: "Return IOH Date", cell: ({ row }) => formatDate(row.getValue("ret_dt_ioh")) },
    { accessorKey: "mlrdt", header: "MLR Date", cell: ({ row }) => formatDate(row.getValue("mlrdt")) },
    { accessorKey: "mlrby", header: "MLR By" },
    { accessorKey: "date_rf", header: "Date RF", cell: ({ row }) => formatDate(row.getValue("date_rf")) },
    { accessorKey: "date_conv", header: "Date Conv", cell: ({ row }) => formatDate(row.getValue("date_conv")) },
    { accessorKey: "lschedule", header: "Last Schedule" },
    { accessorKey: "ns_ss2_3", header: "NS SS2/3" },
    { accessorKey: "allot", header: "Allotment" },
    { accessorKey: "rfid_det", header: "RFID Detail" },
    { accessorKey: "rmpu", header: "RMPU" },
    { accessorKey: "liftdt", header: "Lift Date", cell: ({ row }) => formatDate(row.getValue("liftdt")) },
    { accessorKey: "lowerdt", header: "Lower Date", cell: ({ row }) => formatDate(row.getValue("lowerdt")) },
    { accessorKey: "reliftdt", header: "Re-Lift Date", cell: ({ row }) => formatDate(row.getValue("reliftdt")) },
    { accessorKey: "airbkdt", header: "Air Brake Date", cell: ({ row }) => formatDate(row.getValue("airbkdt")) },
    { accessorKey: "ptindt", header: "PT In Date", cell: ({ row }) => formatDate(row.getValue("ptindt")) },
    { accessorKey: "rfid_dv", header: "RFID DV" },
    { accessorKey: "rfid_nondv", header: "RFID Non-DV" },
    { accessorKey: "ptoutdt", header: "PT Out Date", cell: ({ row }) => formatDate(row.getValue("ptoutdt")) },
    { accessorKey: "cmm_mdepot", header: "CMM MDepot" },
    { accessorKey: "tankfitold", header: "Tank Fit Old" },
    { accessorKey: "tankfitnew", header: "Tank Fit New" },
    { accessorKey: "tankmfg", header: "Tank MFG" },
    { accessorKey: "batteryld", header: "Battery Load" },
    { accessorKey: "fanload", header: "Fan Load" },
    { accessorKey: "lightload", header: "Light Load" },
    { accessorKey: "utkrisht", header: "Utkrisht" },
    { accessorKey: "lavupgrade", header: "Lav Upgrade" },
    { accessorKey: "ventury", header: "Ventury" },
    { accessorKey: "upholstry", header: "Upholstery" },
    { accessorKey: "dyno", header: "Dyno" },
    { accessorKey: "cmm_depot", header: "CMM Depot" },
    { accessorKey: "h_corr", header: "H Corr" },
    { accessorKey: "h_corr_dt", header: "H Corr Date", cell: ({ row }) => formatDate(row.getValue("h_corr_dt")) },
    { accessorKey: "inissue", header: "In Issue", cell: ({ row }) => formatDate(row.getValue("inissue")) },
    { accessorKey: "workdays", header: "Work Days" },
    { accessorKey: "caldays", header: "Cal Days" },
    { accessorKey: "dcwifit", header: "DC WI Fit", cell: ({ row }) => formatDate(row.getValue("dcwifit")) },
    { accessorKey: "elecracfit", header: "Elec Rac Fit", cell: ({ row }) => formatDate(row.getValue("elecracfit")) },
    { accessorKey: "ntxrfit", header: "NTXR Fit", cell: ({ row }) => formatDate(row.getValue("ntxrfit")) },
    { accessorKey: "issuedt", header: "Issue Date" },
    { accessorKey: "innhs1", header: "INNHS1" },
    { accessorKey: "innhs1dt", header: "INNHS1 Date", cell: ({ row }) => formatDate(row.getValue("innhs1dt")) },
    { accessorKey: "innhs2", header: "INNHS2" },
    { accessorKey: "innhs2dt", header: "INNHS2 Date", cell: ({ row }) => formatDate(row.getValue("innhs2dt")) },
    { accessorKey: "cond_pos", header: "Cond Pos" },
    { accessorKey: "date_cond", header: "Date Cond" },
    { accessorKey: "insp_dt", header: "Insp Date", cell: ({ row }) => formatDate(row.getValue("insp_dt")) },
    { accessorKey: "ioh_by", header: "IOH By" },
    { accessorKey: "tnk_c_by", header: "Tank C By" },
    { accessorKey: "other_3", header: "Other 3" },
    { accessorKey: "fiba", header: "FIBA" },
    { accessorKey: "asv", header: "ASV" },
    { accessorKey: "wsp", header: "WSP" },
    { accessorKey: "l_3yr_done", header: "L 3Yr Done", cell: ({ row }) => formatDate(row.getValue("l_3yr_done")) },
    { accessorKey: "l_6yr_done", header: "L 6Yr Done", cell: ({ row }) => formatDate(row.getValue("l_6yr_done")) },
    { accessorKey: "l_9yr_done", header: "L 9Yr Done", cell: ({ row }) => formatDate(row.getValue("l_9yr_done")) },
    { accessorKey: "l_3yr_due", header: "L 3Yr Due", cell: ({ row }) => formatDate(row.getValue("l_3yr_due")) },
    { accessorKey: "l_6yr_due", header: "L 6Yr Due", cell: ({ row }) => formatDate(row.getValue("l_6yr_due")) },
    { accessorKey: "c_r", header: "C R" },
    { accessorKey: "abk", header: "ABK" },
    { accessorKey: "rl", header: "RL" },
    { accessorKey: "pt", header: "PT" },
    { accessorKey: "lif", header: "LIF" },
    { accessorKey: "suspension", header: "Suspension" },
    { accessorKey: "elra", header: "ELRA" },
    { accessorKey: "l_9yr_due", header: "L 9Yr Due", cell: ({ row }) => formatDate(row.getValue("l_9yr_due")) },
    { accessorKey: "uphlddt", header: "Uphld Date", cell: ({ row }) => formatDate(row.getValue("uphlddt")) },
    { accessorKey: "acme", header: "ACME", cell: ({ row }) => formatDate(row.getValue("acme")) },
    { accessorKey: "pfs", header: "PFS" },
    { accessorKey: "uphundt", header: "Uphun Date", cell: ({ row }) => formatDate(row.getValue("uphundt")) },
    { accessorKey: "btlddt", header: "Btld Date", cell: ({ row }) => formatDate(row.getValue("btlddt")) },
    { accessorKey: "btundt", header: "Btun Date", cell: ({ row }) => formatDate(row.getValue("btundt")) },
    { accessorKey: "bt", header: "BT" },
    { accessorKey: "uph", header: "UPH" },
    { accessorKey: "rly", header: "RLY" },
    { accessorKey: "ctype", header: "C Type" },
    { accessorKey: "roamsdt", header: "Roams Date", cell: ({ row }) => formatDate(row.getValue("roamsdt")) },
    { accessorKey: "bvt", header: "BVT" },
    {
        accessorKey: "remark",
        header: "Remark",
        cell: ({ row }) => {
            const remark = row.getValue("remark") as string | null;
            return (
                <div className="max-w-[200px] truncate" title={remark || ''}>
                    {remark || '-'}
                </div>
            );
        },
    },
]

interface DataTableProps {
    data: CoachMaster[];
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

export function MasterRecordDataTable({
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
        fcoachno: false,
        ocoachno: false,
        code: false,
        mfgdt: false,
        fund: false,
        seat: false,
        berth: false,
        cost: false,
        yardindt: false,
        shopindt: false,
        dt_ioh: false,
        duesch: false,
        pohby: false,
        corrstatus: false,
        remark: false,
        re_placed: false,
        dt_placed: false,
        comdt: false,
        remaster: false,
        books: false,
        rakesing: false,
        overagedt: false,
        aboem: false,
        bktype: false,
        cbc: false,
        cbcby: false,
        cbcoem: false,
        coupling: false,
        corrmhrs: false,
        period: false,
        lpohby: false,
        retpohdt: false,
        age_rt_dt: false,
        ret_dt_ioh: false,
        mlrdt: false,
        mlrby: false,
        date_rf: false,
        date_conv: false,
        lschedule: false,
        ns_ss2_3: false,
        allot: false,
        rfid_det: false,
        rmpu: false,
        liftdt: false,
        lowerdt: false,
        reliftdt: false,
        airbkdt: false,
        ptindt: false,
        rfid_dv: false,
        rfid_nondv: false,
        ptoutdt: false,
        cmm_mdepot: false,
        tankfitold: false,
        tankfitnew: false,
        tankmfg: false,
        batteryld: false,
        fanload: false,
        lightload: false,
        utkrisht: false,
        lavupgrade: false,
        ventury: false,
        upholstry: false,
        dyno: false,
        cmm_depot: false,
        h_corr: false,
        h_corr_dt: false,
        inissue: false,
        workdays: false,
        caldays: false,
        dcwifit: false,
        elecracfit: false,
        ntxrfit: false,
        issuedt: false,
        innhs1: false,
        innhs1dt: false,
        innhs2: false,
        innhs2dt: false,
        cond_pos: false,
        date_cond: false,
        insp_dt: false,
        ioh_by: false,
        tnk_c_by: false,
        other_3: false,
        fiba: false,
        asv: false,
        wsp: false,
        l_3yr_done: false,
        l_6yr_done: false,
        l_9yr_done: false,
        l_3yr_due: false,
        l_6yr_due: false,
        c_r: false,
        abk: false,
        rl: false,
        pt: false,
        lif: false,
        suspension: false,
        elra: false,
        l_9yr_due: false,
        uphlddt: false,
        acme: false,
        pfs: false,
        uphundt: false,
        btlddt: false,
        btundt: false,
        bt: false,
        uph: false,
        rly: false,
        ctype: false,
        roamsdt: false,
        bvt: false,
    })
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [sorting, setSorting] = React.useState<SortingState>([])

    // Edit Sheet State
    const [editingCoach, setEditingCoach] = React.useState<CoachMaster | null>(null)
    const [isEditSheetOpen, setIsEditSheetOpen] = React.useState(false)

    // Filter Sheet State
    const [isFilterSheetOpen, setIsFilterSheetOpen] = React.useState(false)

    const handleEdit = (coach: CoachMaster) => {
        setEditingCoach(coach)
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
        manualPagination: true, // Enable server-side pagination [web:11][web:12]
        manualSorting: false, // Change to true if you want server-side sorting
        manualFiltering: true, // Enable server-side filtering
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

            <MasterRecordEditSheet
                open={isEditSheetOpen}
                onOpenChange={setIsEditSheetOpen}
                coach={editingCoach}
            />

            <AdvancedFilterSheet
                open={isFilterSheetOpen}
                onOpenChange={setIsFilterSheetOpen}
                columns={masterFilterableColumns}
                onApplyFilters={onAdvancedFiltersChange}
                initialConditions={advancedFilters}
            />
        </div>
    )
}
