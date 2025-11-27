import { cookies } from "next/headers"

import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"
import { getUserInfo } from "@/app/actions"
import { AppSidebar } from "@/components/authenticated/components/app-sidebar"
import { SiteHeader } from "@/components/authenticated/components/site-header"

export default async function AuthenticatedLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const cookieStore = await cookies()
    const defaultOpen = cookieStore.get("sidebar_state")?.value === "true"
    const theme = cookieStore.get("theme")?.value || "light"
    const userInfo = await getUserInfo()

    return (
        <SidebarProvider
            defaultOpen={defaultOpen}
            style={
                {
                    "--sidebar-width": "calc(var(--spacing) * 72)",
                } as React.CSSProperties
            }
        >
            <AppSidebar variant="inset" userInfo={userInfo} />
            <SidebarInset>
                <SiteHeader theme={theme} />
                <div className="flex flex-1 flex-col">{children}</div>
            </SidebarInset>
        </SidebarProvider>
    )
}