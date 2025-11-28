"use client"

import { HistoryQueryParams } from '@/app/(authenticated)/history-report/types';
import { useDebounce } from '@/hooks/use-debounce';
import { useState, useEffect } from 'react';
import { useHistory } from './use-history-report';
import { HistoryRecordDataTable } from './history-record-data-table';

export function HistoryRecordTable() {
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });

    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearch = useDebounce(searchQuery, 500);

    // Reset to page 1 when search query changes
    useEffect(() => {
        setPagination(prev => ({ ...prev, pageIndex: 0 }));
    }, [debouncedSearch]);

    const queryParams: HistoryQueryParams = {
        page: pagination.pageIndex + 1,
        pageSize: pagination.pageSize,
        coachno: debouncedSearch || undefined,
    };

    const { data, isLoading, error } = useHistory(queryParams);

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-destructive">Error loading history data: {error.message}</p>
            </div>
        );
    }

    return (
        <HistoryRecordDataTable
            data={data?.items || []}
            pageCount={data?.pagination.totalPages || 0}
            pageIndex={pagination.pageIndex}
            pageSize={pagination.pageSize}
            total={data?.pagination.total || 0}
            onPaginationChange={setPagination}
            isLoading={isLoading}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
        />
    );
}
