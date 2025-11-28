'use client';

import { CoachMasterQueryParams } from '@/app/(authenticated)/master-report/types';
import { useDebounce } from '@/hooks/use-debounce';
import { useState } from 'react';
import { MasterRecordDataTable } from './master-record-data-table';
import { useCoachMaster } from './use-master-report';

export function MasterRecordTable() {
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearch = useDebounce(searchQuery, 500);

    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });

    const queryParams: CoachMasterQueryParams = {
        page: pagination.pageIndex + 1,
        pageSize: pagination.pageSize,
        coachno: debouncedSearch || undefined,
    };

    const { data, isLoading, error } = useCoachMaster(queryParams);

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
        />
    );
}
