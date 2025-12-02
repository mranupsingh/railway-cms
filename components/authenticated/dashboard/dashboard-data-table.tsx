"use client"

import { keepPreviousData, useQuery } from "@tanstack/react-query"
import * as React from "react"

import { getCoaches } from "@/app/(authenticated)/dashboard/actions"
import { FilterCondition } from "@/app/lib/types/filter"
import { AdvancedFilterSheet } from "@/components/authenticated/components/advanced-filter-sheet"
import { CommonDataTable } from "@/components/authenticated/components/common-data-table"
import { masterFilterableColumns } from "@/components/authenticated/master-report/filterable-columns"
import { createColumns } from "@/components/authenticated/master-report/master-record-data-table"

export function DashboardDataTable() {
    // State
    const [pagination, setPagination] = React.useState({
        pageIndex: 0,
        pageSize: 10,
    })
    const [searchQuery, setSearchQuery] = React.useState("")
    const [activeTab, setActiveTab] = React.useState("PL")
    const [advancedFilters, setAdvancedFilters] = React.useState<FilterCondition[]>([])
    const [isFilterSheetOpen, setIsFilterSheetOpen] = React.useState(false)

    // Data Fetching
    const { data: queryData, isLoading } = useQuery({
        queryKey: ['dashboard-coaches', pagination, searchQuery, activeTab, advancedFilters],
        queryFn: async () => {
            return await getCoaches({
                page: pagination.pageIndex + 1,
                pageSize: pagination.pageSize,
                search: searchQuery,
                type: activeTab as "PL" | "YD",
                filters: advancedFilters,
            })
        },
        placeholderData: keepPreviousData,
    })

    const data = queryData?.data || []
    const total = queryData?.metadata?.total || 0
    const pageCount = queryData?.metadata?.totalPages || 0

    // Columns
    const columns = React.useMemo(() => createColumns(), [])

    // Tabs Configuration
    const tabs = [
        { value: "PL", label: "Coaches in Parel" },
        { value: "YD", label: "Coaches in Yard" },
    ]

    return (
        <>
            <CommonDataTable
                columns={columns}
                data={data as any[]} // Type assertion to avoid strict mismatch for now
                pageCount={pageCount}
                pageIndex={pagination.pageIndex}
                pageSize={pagination.pageSize}
                total={total}
                onPaginationChange={setPagination}
                isLoading={isLoading}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onFilterClick={() => setIsFilterSheetOpen(true)}
                activeFiltersCount={advancedFilters.length}
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={(value) => {
                    setActiveTab(value)
                    setPagination({
                        pageIndex: 0,
                        pageSize: 10,
                    })
                }}
            />

            <AdvancedFilterSheet
                open={isFilterSheetOpen}
                onOpenChange={setIsFilterSheetOpen}
                columns={masterFilterableColumns}
                onApplyFilters={setAdvancedFilters}
                initialConditions={advancedFilters}
            />
        </>
    )
}
