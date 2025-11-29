import { cookies } from "next/headers"

import { getUserInfo } from "@/app/actions"
import { AppSidebar } from "@/components/authenticated/components/app-sidebar"
import {
    SidebarProvider
} from "@/components/ui/sidebar"

export default async function AuthenticatedLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const cookieStore = await cookies()
    const defaultOpen = cookieStore.get("sidebar_state")?.value === "true"
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
            {children}
        </SidebarProvider>
    )
}