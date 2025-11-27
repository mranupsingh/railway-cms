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

export async function handleServerAction<T>(
    action: () => Promise<T>,
    errorContext?: string
): Promise<ApiActionResponse<T>> {
    try {
        const result = await action();
        return { success: true, data: result };
    } catch (error: any) {
        if (isRedirectError(error)) {
            throw error;
        }

        const errorMessage = isApiError(error)
            ? error.error
            : error?.message || 'An unexpected error occurred';

        const status = isApiError(error) ? error.status : 500;

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
