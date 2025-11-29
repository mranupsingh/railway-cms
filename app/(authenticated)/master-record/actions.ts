'use server';

import { ENDPOINTS, httpServer } from "@/app/lib/https";
import { CoachMasterQueryParams, CoachMasterReportInfo, CoachMasterResponse } from "./types";
import { ApiActionResponse, handleServerAction } from "@/app/lib/https/serverActionHelpers";
import { unwrapApiResponse } from "@/app/lib/https/utils";

export async function getCoachMasterData(params: CoachMasterQueryParams = {}): Promise<ApiActionResponse<CoachMasterReportInfo>> {

    const result = await handleServerAction(async () => {
        const response = await httpServer.get<CoachMasterResponse>(
            ENDPOINTS.COACH.MASTER.GET,
            {
                params: params
            }
        );

        return unwrapApiResponse<CoachMasterReportInfo>(response)

    }, 'getMasterDataAction')

    if (!result.success) {
        console.log(result.error)
        throw new Error(result.error || 'Something went wrong')
    }

    return result
}

export async function updateCoachMaster(coachno: string, data: Partial<any>): Promise<ApiActionResponse<any>> {
    const result = await handleServerAction(async () => {
        const response = await httpServer.patch<any>(
            ENDPOINTS.COACH.MASTER.GET + `/${coachno}`,
            data
        );

        return unwrapApiResponse<any>(response)
    }, 'updateMasterDataAction')

    if (!result.success) {
        console.log(result.error)
        throw new Error(result.error || 'Something went wrong')
    }

    return result
}
