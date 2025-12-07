import { getAuthToken, decrypt } from "@/app/(public)/(auth)/actions";
import prisma from "@/lib/db/prisma";
import { ROUTE } from "./routes";

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE';

export interface AuditLogParams {
    action: AuditAction;
    entity: string;
    entityId: string;
    oldData?: any;
    newData?: any;
    details?: string;
}

function calculateDiff(oldData: any, newData: any): { oldDiff: any, newDiff: any } {
    if (oldData === newData) return { oldDiff: undefined, newDiff: undefined };
    if (!oldData || !newData) return { oldDiff: oldData, newDiff: newData };

    if (Array.isArray(oldData) && Array.isArray(newData)) {
        const oldDiffArr: any[] = [];
        const newDiffArr: any[] = [];
        let hasChanges = false;

        oldData.forEach((item, index) => {
            const newItem = newData[index];
            const { oldDiff, newDiff } = calculateDiff(item, newItem);
            if (oldDiff !== undefined || newDiff !== undefined) {
                // Include an identifier if possible, e.g., coachno or id
                const id = item.coachno || item.id || index;
                oldDiffArr.push({ _id: id, ...oldDiff });
                newDiffArr.push({ _id: id, ...newDiff });
                hasChanges = true;
            }
        });

        return hasChanges ? { oldDiff: oldDiffArr, newDiff: newDiffArr } : { oldDiff: undefined, newDiff: undefined };
    }

    if (typeof oldData === 'object' && typeof newData === 'object') {
        const oldDiff: any = {};
        const newDiff: any = {};
        let hasChanges = false;

        const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);

        allKeys.forEach(key => {
            const oldValue = oldData[key];
            const newValue = newData[key];

            if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
                oldDiff[key] = oldValue;
                newDiff[key] = newValue;
                hasChanges = true;
            }
        });

        return hasChanges ? { oldDiff, newDiff } : { oldDiff: undefined, newDiff: undefined };
    }

    return { oldDiff: oldData, newDiff: newData };
}

export async function logUserActivity(params: AuditLogParams) {
    try {
        const token = await getAuthToken();
        if (!token) {
            console.warn('Audit log skipped: No auth token found');
            return;
        }

        const payload = await decrypt(token);
        if (!payload) {
            console.warn('Audit log skipped: Invalid token');
            return;
        }
        const userId = payload.userId || payload.email || payload.userId || 'unknown';

        const { oldDiff, newDiff } = calculateDiff(params.oldData, params.newData);

        await (prisma as any).user_activity_logs.create({
            data: {
                user_id: String(userId),
                action: params.action,
                entity: params.entity,
                entity_id: params.entityId,
                old_data: oldDiff ?? undefined,
                new_data: newDiff ?? undefined,
                details: params.details,
            },
        });

        // Send notification to other users
        const otherUsersTokens = await (prisma as any).user_fcm_tokens.findMany({
            where: {
                user_id: {
                    not: String(userId)
                }
            },
            select: {
                token: true
            }
        });

        if (otherUsersTokens.length > 0) {
            const admin = (await import("@/lib/firebase-admin")).initFirebaseAdmin();
            // Use Set to ensure uniqueness, though DB constraint should handle it
            const uniqueTokens = new Set(otherUsersTokens.map((t: any) => t.token));
            const tokens = Array.from(uniqueTokens) as string[];

            // Fetch user details for better message
            let userName = String(userId);
            try {
                const user = await (prisma as any).users.findUnique({
                    where: {
                        login_id: String(userId)
                    }
                });
                if (user) {
                    userName = user.username || user.login_id;
                }
            } catch (e) {
                console.warn("Could not fetch user details for notification");
            }

            const title = `${params.action} on ${params.entity} - ${params.entityId}`;
            const body = `${userName} performed this action at ${new Date().toLocaleTimeString()}`;

            // We can use multicast for efficiency
            if (tokens.length > 0) {
                await admin.messaging().sendEachForMulticast({
                    tokens: tokens,
                    notification: {
                        title: title,
                        body: body,
                    },
                    webpush: {
                        fcmOptions: {
                            link: `${process.env.NEXT_PUBLIC_API_URL}${ROUTE.LOGS}` // Sending them to logs page
                        }
                    }
                });
            }
        }

    } catch (error) {
        console.error('Failed to log user activity:', error);
        // Don't throw error to avoid blocking the main action
    }
}
