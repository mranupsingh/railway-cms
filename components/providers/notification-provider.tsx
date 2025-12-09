"use client";
import React, { createContext, useContext } from "react";
import useFcmToken from "@/hooks/use-fcm-token";

interface NotificationContextType {
    token: string | null;
    notificationPermissionStatus: NotificationPermission | null;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const { token, notificationPermissionStatus } = useFcmToken();

    return (
        <NotificationContext.Provider value={{ token, notificationPermissionStatus }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotification() {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error("useNotification must be used within a NotificationProvider");
    }
    return context;
}
