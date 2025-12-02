'use server';

import { ENDPOINTS, httpServer } from "@/app/lib/https";
import { HistoryQueryParams, HistoryReportInfo, HistoryResponse } from "./types";
import { ApiActionResponse, handleServerAction } from "@/app/lib/https/serverActionHelpers";
import { unwrapApiResponse } from "@/app/lib/https/utils";

export async function getHistoryData(params: HistoryQueryParams = {}): Promise<ApiActionResponse<HistoryReportInfo>> {

    const result = await handleServerAction(async () => {
        const response = await httpServer.get<HistoryResponse>(
            ENDPOINTS.COACH.HISTORY.GET,
            {
                params: params
            }
        );

        return unwrapApiResponse<HistoryReportInfo>(response)

    }, 'getHistoryDataAction')

    if (!result.success) {
        console.log(result.error)
        throw new Error(result.error || 'Something went wrong')
    }

    return result
}

export async function updateHistory(id: string, data: Partial<any>): Promise<ApiActionResponse<any>> {
    const result = await handleServerAction(async () => {
        const response = await httpServer.patch<any>(
            ENDPOINTS.COACH.HISTORY.UPDATE(id),
            data
        );

        return unwrapApiResponse<any>(response)
    }, 'updateHistoryAction')

    if (!result.success) {
        console.log(result.error)
        throw new Error(result.error || 'Something went wrong')
    }

    return result
}
