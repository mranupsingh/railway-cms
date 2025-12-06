'use server'

import { AUTH_TOKEN, USER_INFO } from "@/lib/constants";
import { ENDPOINTS, httpServer } from "@/app/lib/https";
import { handleServerAction } from "@/app/lib/https/serverActionHelpers";
import { unwrapApiResponse } from "@/app/lib/https/utils";
import { ROUTE } from "@/lib/routes";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LoginData, LoginResponse } from "./types";

export async function loginAction(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const result = await handleServerAction(async () => {
        const response = await httpServer.post<LoginResponse>(
            ENDPOINTS.AUTH.LOGIN,
            { email, password }
        );

        const loginData = unwrapApiResponse<LoginData>(response)

        // Set cookie inside the action
        const expires = new Date(Date.now() + 60 * 60 * 24 * 1000);
        cookies().set(AUTH_TOKEN, loginData.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            expires,
            sameSite: 'lax',
            path: '/',
        });

        cookies().set(USER_INFO, JSON.stringify(loginData.user), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            expires,
            sameSite: 'lax',
            path: '/',
        })

        return loginData;
    }, 'loginAction')

    if (result.success) {
        redirect(ROUTE.DASHBOARD);
    } else {
        return result
        // redirect(`${ROUTE.LOGIN}?error=${encodeURIComponent(result.error)}`);
    }
}

export async function logoutAction() {
    cookies().delete(AUTH_TOKEN);
    cookies().delete(USER_INFO);
    redirect(ROUTE.LOGIN);
}