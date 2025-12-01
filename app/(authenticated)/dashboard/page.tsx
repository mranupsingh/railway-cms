import { getCoaches, getDashboardStats } from "@/app/(authenticated)/dashboard/actions"
import { ChartAreaInteractive } from "@/components/authenticated/components/chart-area-interactive"
import { DashboardStats } from "@/components/authenticated/dashboard/dashboard-stats"
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query"
import { Metadata } from "next"
import { DashboardDataTable } from "../../../components/authenticated/dashboard/dashboard-data-table"

export const metadata: Metadata = {
    title: "Dashboard | Railway CMS",
    description: "Railway coach management system dashboard. View analytics, statistics, and recent coach activities at a glance.",
    keywords: ["railway", "dashboard", "coach management", "analytics", "statistics", "railway cms", "train coaches"],
}

export default async function DashboardPage() {
    const queryClient = new QueryClient()

    // Prefetch Dashboard Stats
    await queryClient.prefetchQuery({
        queryKey: ["dashboard-stats"],
        queryFn: () => getDashboardStats(),
    })

    // Prefetch Coaches (Parel - Default Tab)
    await queryClient.prefetchQuery({
        queryKey: ["dashboard-coaches", { pageIndex: 0, pageSize: 10 }, "", "PL", []],
        queryFn: () => getCoaches({ page: 1, pageSize: 10, type: "PL" }),
    })

    // Prefetch Coaches (Yard) - Optional, but good for fast tab switching
    await queryClient.prefetchQuery({
        queryKey: ["dashboard-coaches", { pageIndex: 0, pageSize: 10 }, "", "YD", []],
        queryFn: () => getCoaches({ page: 1, pageSize: 10, type: "YD" }),
    })

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                    <DashboardStats />
                    <div className="space-y-6 px-4 lg:px-6">
                        <ChartAreaInteractive />
                        <DashboardDataTable />
                    </div>
                </div>
            </div>
        </HydrationBoundary>
    )
}