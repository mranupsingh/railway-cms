'use server';

import { ENDPOINTS, httpServer } from "@/app/lib/https";
import { ApiActionResponse, handleServerAction } from "@/app/lib/https/serverActionHelpers";
import { unwrapApiResponse } from "@/app/lib/https/utils";

import { UpdateAirBrakeDateRequest, UpdateAirBrakeDateResponse } from "./types";

export async function updateAirBrakeDate(data: UpdateAirBrakeDateRequest): Promise<ApiActionResponse<UpdateAirBrakeDateResponse>> {
    const result = await handleServerAction(async () => {
        const response = await httpServer.post<UpdateAirBrakeDateResponse>(
            ENDPOINTS.COACH.AIR_BRAKE.BULK_UPDATE,
            data
        );

        return unwrapApiResponse<UpdateAirBrakeDateResponse>(response)
    }, 'updateAirBrakeDateAction')

    if (!result.success) {
        console.log(result.error)
        throw new Error(result.error || 'Something went wrong')
    }

    return result
}
