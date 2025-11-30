"use client"

import { useQuery } from "@tanstack/react-query"
import { getDashboardStats } from "@/app/(authenticated)/dashboard/actions"
import { SectionCards } from "@/components/authenticated/components/section-cards"

export function DashboardStats() {
    const { data: stats, isLoading } = useQuery({
        queryKey: ["dashboard-stats"],
        queryFn: () => getDashboardStats(),
    })

    if (isLoading || !stats) {
        return (
            <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-32 animate-pulse rounded-xl bg-muted" />
                ))}
            </div>
        )
    }

    return <SectionCards stats={stats} />
}
