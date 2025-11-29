
export interface ApiResponse<T> {
    data?: T;
    error?: string;
    status?: number;
    statusText?: string;
}

export interface ApiError {
    error: string;
    status: number;
    data?: any;
    type: 'API_ERROR';
}

export interface RequestConfig {
    params?: Record<string, any>;
    headers?: Record<string, string>;
}

export enum ApiVersion {
    V1 = "v1",
    V2 = "v2",
}

export interface PaginationMeta {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
}

export interface GenericApiResponse<T> {
    statusCode: number;
    success: boolean;
    message?: string;
    data: T;
}

export interface UnwrappedResponse<T> {
    data: T;
    meta?: PaginationMeta;
}