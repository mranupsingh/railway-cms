'use client';

import { CoachMasterQueryParams } from '@/app/(authenticated)/master-report/types';
import { useDebounce } from '@/hooks/use-debounce';
import { useState, useEffect } from 'react';
import { MasterRecordDataTable } from './master-record-data-table';
import { useMasterRecord } from './use-master-report';
import { FilterCondition } from '@/app/lib/types/filter';

export function MasterRecordTable() {
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearch = useDebounce(searchQuery, 500);
    const [advancedFilters, setAdvancedFilters] = useState<FilterCondition[]>([]);

    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });

    // Reset to page 1 when search query changes
    useEffect(() => {
        setPagination(prev => ({ ...prev, pageIndex: 0 }));
    }, [debouncedSearch]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setPagination(prev => ({ ...prev, pageIndex: 0 }));
    }, [advancedFilters]);

    const queryParams: CoachMasterQueryParams = {
        page: pagination.pageIndex + 1,
        pageSize: pagination.pageSize,
        ...(debouncedSearch && { coachno: debouncedSearch }),
        ...(advancedFilters.length > 0 && { filters: JSON.stringify(advancedFilters) }),
    };

    const { data, isLoading, error } = useMasterRecord(queryParams);

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-red-500 font-semibold">Error loading data</p>
                    <p className="text-sm text-muted-foreground mt-2">
                        {error instanceof Error ? error.message : 'Unknown error occurred'}
                    </p>
                </div>
            </div>
        );
    }

    const coaches = data?.items || [];
    const total = data?.pagination?.total || 0;
    const pageCount = data?.pagination?.totalPages || 0;

    return (
        <MasterRecordDataTable
            data={coaches}
            pageCount={pageCount}
            pageIndex={pagination.pageIndex}
            pageSize={pagination.pageSize}
            total={total}
            onPaginationChange={setPagination}
            isLoading={isLoading}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            advancedFilters={advancedFilters}
            onAdvancedFiltersChange={setAdvancedFilters}
        />
    );
}
