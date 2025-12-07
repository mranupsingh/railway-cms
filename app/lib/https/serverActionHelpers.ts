import { AuditAction, logUserActivity } from '@/lib/audit';
import { isRedirectError } from 'next/dist/client/components/redirect';
import { isApiError } from './utils';

export interface ApiErrorResponse {
    success: false;
    error: string;
    status?: number;
}

export interface ApiSuccessResponse<T> {
    success: true;
    data: T;
}

export type ApiActionResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface AuditOptions<T> {
    action: AuditAction;
    entity: string;
    entityId: string | ((result: T) => string);
    getOldData?: () => Promise<any>;
    getNewData?: (result: T) => Promise<any> | any;
    details?: string;
}

export async function handleServerAction<T>(
    action: () => Promise<T>,
    errorContext?: string,
    auditOptions?: AuditOptions<T>
): Promise<ApiActionResponse<T>> {
    try {
        let oldData: any;
        if (auditOptions?.getOldData) {
            try {
                oldData = await auditOptions.getOldData();
            } catch (e) {
                console.error('Failed to fetch old data for audit:', e);
            }
        }

        const result = await action();

        if (auditOptions) {
            try {
                const entityId = typeof auditOptions.entityId === 'function'
                    ? auditOptions.entityId(result)
                    : auditOptions.entityId;

                const newData = auditOptions.getNewData
                    ? await auditOptions.getNewData(result)
                    : undefined;

                logUserActivity({
                    action: auditOptions.action,
                    entity: auditOptions.entity,
                    entityId,
                    oldData,
                    newData,
                    details: auditOptions.details
                });
            } catch (e) {
                console.error('Failed to log audit activity:', e);
            }
        }

        return { success: true, data: result };
    } catch (error: any) {
        if (isRedirectError(error)) {
            throw error;
        }

        const errorMessage = isApiError(error)
            ? error.data.error
            : error.data.error || error?.message || 'An unexpected error occurred';

        const status = isApiError(error) ? error.data.status : 500;

        console.error(`Server Action Error${errorContext ? ` [${errorContext}]` : ''}:`, {
            type: isApiError(error) ? 'API_ERROR' : 'UNKNOWN_ERROR',
            message: errorMessage,
            status,
            ...(isApiError(error) && error.data && { apiData: error.data }),
        });

        return {
            success: false,
            error: errorMessage,
            status,
        };
    }
}
