import { ApiError, ApiResponse, UnwrappedResponse } from "./types";

export function handleApiError(error: any): never {
    const message = error?.response?.data?.message || error?.message || "Unknown API error";
    const status = error?.response?.status || 500;
    const data = error?.response?.data || null;

    const apiError: ApiError = {
        type: 'API_ERROR',
        error: message,
        status,
        data,
    };

    throw apiError;
}

export function unwrapApiResponse<T>(response: ApiResponse<any>): T {
    if (!response?.data) {
        throw new Error('No data returned from API');
    }

    const apiResponse = response.data;

    if (!apiResponse?.success) {
        throw new Error(apiResponse?.message || 'API request failed');
    }

    return apiResponse.data
}

export function isApiError(error: any): error is ApiError {
    return error?.type === 'API_ERROR';
}