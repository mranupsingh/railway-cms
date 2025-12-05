import { cookies } from "next/headers"

import { SiteHeader } from "@/components/authenticated/components/site-header"
import {
    SidebarInset
} from "@/components/ui/sidebar"

export default async function ElectricNtxrLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const cookieStore = await cookies()
    const theme = cookieStore.get("theme")?.value || "light"

    return (
        <SidebarInset>
            <SiteHeader title="Electric and NTXR Fit" theme={theme} />
            <div className="flex flex-1 flex-col">{children}</div>
        </SidebarInset>
    )
}
