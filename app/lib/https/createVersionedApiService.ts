import { AxiosInstance } from "axios";
import { ApiResponse, ApiVersion, RequestConfig } from "./types";
import { handleApiError } from "./utils";

export function createVersionedApiService(axiosInstance: AxiosInstance, version: ApiVersion) {
    const buildUrl = (endpoint: string) => `/${version}/${endpoint.replace(/^\/+/, "")}`;

    return {
        async get<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
            try {
                const response = await axiosInstance.get<T>(buildUrl(endpoint), config);
                return { data: response.data, status: response.status };
            } catch (error: any) {
                throw handleApiError(error);
            }
        },

        async post<T>(endpoint: string, body?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
            try {
                const response = await axiosInstance.post<T>(buildUrl(endpoint), body, config);
                return { data: response.data, status: response.status };
            } catch (error: any) {
                throw handleApiError(error);
            }
        },

        async put<T>(endpoint: string, body?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
            try {
                const response = await axiosInstance.put<T>(buildUrl(endpoint), body, config);
                return { data: response.data, status: response.status };
            } catch (error: any) {
                throw handleApiError(error);
            }
        },

        async patch<T>(endpoint: string, body?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
            try {
                const response = await axiosInstance.patch<T>(buildUrl(endpoint), body, config);
                return { data: response.data, status: response.status };
            } catch (error: any) {
                throw handleApiError(error);
            }
        },

        async delete<T>(endpoint: string, body?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
            try {
                const response = await axiosInstance.delete<T>(buildUrl(endpoint), {
                    ...config,
                    data: body
                });
                return { data: response.data, status: response.status };
            } catch (error: any) {
                throw handleApiError(error);
            }
        },
    };
}
