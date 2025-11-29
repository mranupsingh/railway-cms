import { SectionCards } from "@/components/authenticated/components/section-cards"
import data from "./data.json"
import { ChartAreaInteractive } from "@/components/authenticated/components/chart-area-interactive"
import { DataTable } from "@/components/authenticated/components/data-table"
import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Dashboard | Railway CMS",
    description: "Railway coach management system dashboard. View analytics, statistics, and recent coach activities at a glance.",
    keywords: ["railway", "dashboard", "coach management", "analytics", "statistics", "railway cms", "train coaches"],
}

export default function DashboardPage() {
    return (
        <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <SectionCards />
                <div className="px-4 lg:px-6">
                    <ChartAreaInteractive />
                </div>
                <DataTable data={data} />
            </div>
        </div>
    )
}