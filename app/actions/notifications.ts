"use server";

import prisma from "@/lib/db/prisma";
import { getAuthToken, decrypt } from "@/app/(public)/(auth)/actions";

export async function saveFcmToken(token: string) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { success: false, error: "Unauthorized" };
        }

        const payload = await decrypt(authToken);
        if (!payload || !payload.userId) {
            return { success: false, error: "Invalid token" };
        }

        const userId = String(payload.userId);

        await prisma.user_fcm_tokens.upsert({
            where: {
                token: token,
            },
            update: {
                updated_at: new Date(),
                user_id: userId
            },
            create: {
                user_id: userId,
                token: token,
                device_type: "web", // Defaulting to web for now
            },
        });

        return { success: true };
    } catch (error) {
        console.error("Error saving FCM token:", error);
        return { success: false, error: "Failed to save token" };
    }
}
