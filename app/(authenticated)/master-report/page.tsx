import { COACH_MASTER_QUERY_KEY } from '@/components/authenticated/master-report/use-master-report';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { getCoachMasterData } from './actions';
import { MasterRecordTable } from '@/components/authenticated/master-report';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Master Record | Railway CMS",
    description: "Comprehensive railway coach master record management. Search, view, and edit detailed coach information including maintenance history, specifications, and operational data.",
    keywords: ["railway", "master record", "coach database", "coach management", "maintenance", "railway cms", "train coaches", "coach details", "inventory"],
}

export default async function MasterRecordPage() {
    const queryClient = new QueryClient();

    await queryClient.prefetchQuery({
        queryKey: [COACH_MASTER_QUERY_KEY, { page: 1, pageSize: 10 }],
        queryFn: async () => {
            const result = await getCoachMasterData();

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
                        <MasterRecordTable />
                    </div>
                </div>
            </div>
        </HydrationBoundary>
    );
}
