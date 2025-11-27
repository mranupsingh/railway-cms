'use server'

import { getAuthToken } from "@/app/(public)/(auth)/actions";
import { logoutAction } from "@/app/(public)/(auth)/login/actions";
import axios from "axios";
import https from 'https';

const isDevelopment = process.env.NODE_ENV === 'development';

export const serverApi = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    ...(isDevelopment && {
        httpsAgent: new https.Agent({
            rejectUnauthorized: false,
        }),
    }),
    headers: {
        "Content-Type": "application/json",
    },
});

serverApi.interceptors.request.use(async (config) => {
    const token = await getAuthToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

serverApi.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error?.response?.status;
        const message = error?.response?.data?.message || error?.message || "An error occurred";

        // Log the error
        console.error("Server API Error:", {
            status,
            message,
            url: error?.config?.url,
            method: error?.config?.method,
        });

        if (status === 401) {
            logoutAction()
        }

        return Promise.reject(error);
    }
);