import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { getHistoryData } from './actions';
import { HistoryRecordTable } from '@/components/authenticated/history-report';
import { Metadata } from 'next';
import { HISTORY_QUERY_KEY } from './types';

export const metadata: Metadata = {
    title: "History Record | Railway CMS",
    description: "Historical railway coach records and maintenance history. Search, view, and manage historical coach data including past maintenance, modifications, and operational records.",
    keywords: ["railway", "history record", "coach history", "maintenance history", "railway cms", "historical data", "coach records", "archive"],
}

export default async function HistoryRecordPage() {
    const queryClient = new QueryClient();

    await queryClient.prefetchQuery({
        queryKey: [HISTORY_QUERY_KEY, { page: 1, pageSize: 10 }],
        queryFn: async () => {
            const result = await getHistoryData();

            if (!result.success) {
                console.log(result.error)
                throw new Error(result.error)
            }

            return result.data
        },
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                    <div className="px-4 lg:px-6">
                        <HistoryRecordTable />
                    </div>
                </div>
            </div>
        </HydrationBoundary>
    );
}
