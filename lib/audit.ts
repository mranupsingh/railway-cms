import { getAuthToken, decrypt } from "@/app/(public)/(auth)/actions";
import prisma from "@/lib/db/prisma";

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
    } catch (error) {
        console.error('Failed to log user activity:', error);
        // Don't throw error to avoid blocking the main action
    }
}
