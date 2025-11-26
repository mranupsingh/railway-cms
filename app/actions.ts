"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { ROUTE } from "@/lib/routes"
import { UserInfo } from "./lib/types"
import { USER_INFO } from "@/lib/constants"

export async function setThemeCookie(theme: string) {
    cookies().set("theme", theme, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365, // 1 year
    })
    revalidatePath(ROUTE.HOME, "layout")
}

export async function getUserInfo(): Promise<UserInfo | null> {
    try {
        const userInfo = cookies().get(USER_INFO)?.value

        if (userInfo?.length) {
            return JSON.parse(userInfo)
        }

        return null

    } catch (error) {
        return null
    }
}