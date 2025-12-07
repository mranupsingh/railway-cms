"use client";

import useFcmToken from "@/hooks/use-fcm-token";

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    useFcmToken();
    return <>{children}</>;
}
