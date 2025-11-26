"use client"

import { setThemeCookie } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"

export function ThemeToggle({ currentTheme }: { currentTheme: string }) {
    const handleToggle = async () => {
        const newTheme = currentTheme === "dark" ? "light" : "dark"
        await setThemeCookie(newTheme)
    }

    return (
        <Button variant="ghost" size="icon" onClick={handleToggle}>
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
        </Button>
    )
}