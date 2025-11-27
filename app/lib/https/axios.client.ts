'use client'

import { showToast } from "@/components/ui/sonner";
import axios, { InternalAxiosRequestConfig } from "axios";

export const clientApi = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        "Content-Type": "application/json",
    },
    // withCredentials: true,
});

clientApi.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    // const token = store?.getState().authToken;

    // if (token) {
    //     config.headers.Authorization = `Bearer ${token}`;
    // }

    return config;
});


clientApi.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error?.response?.status;
        const message = error?.response?.data?.message || error?.message || "An error occurred";

        // Handle 401 Unauthorized
        if (status === 401) {
            showToast(error?.response?.data?.error ?? "Session expired. Please login again.", { variant: 'error' });

            return Promise.reject(error);
        }

        // Show toast for other errors
        showToast(message, { variant: "error" });
        return Promise.reject(error);
    }
);
