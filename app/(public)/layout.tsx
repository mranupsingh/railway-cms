import { cookies } from "next/headers"

import { ThemeToggle } from "@/components/common/theme-toggle"
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"

export default async function LoginLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const cookieStore = await cookies()
    const defaultOpen = cookieStore.get("sidebar_state")?.value === "true"
    const theme = cookieStore.get("theme")?.value || "light"

    return (
        <>
            <header className="bg-muted group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-[60px] shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
                <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
                    <div className="ml-auto">
                        <ThemeToggle currentTheme={theme} />
                    </div>
                </div>
            </header>
            <div className="flex flex-1 flex-col h-[calc(100vh-60px)]">{children}</div>
        </>
    )
}