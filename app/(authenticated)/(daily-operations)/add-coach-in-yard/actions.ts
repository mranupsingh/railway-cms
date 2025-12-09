'use server';

import { ENDPOINTS, httpServer } from "@/app/lib/https";
import { ApiActionResponse, handleServerAction } from "@/app/lib/https/serverActionHelpers";
import { unwrapApiResponse } from "@/app/lib/https/utils";

import { AddCoachInYardRequest, AddCoachInYardResponse } from "./types";

export async function addCoachToYard(data: AddCoachInYardRequest): Promise<ApiActionResponse<AddCoachInYardResponse>> {
    return await handleServerAction(async () => {
        const response = await httpServer.post<AddCoachInYardResponse>(
            ENDPOINTS.COACH.YARD.ADD,
            data
        );

        return unwrapApiResponse<AddCoachInYardResponse>(response)
    }, 'addCoachToYardAction', {
        action: 'CREATE',
        entity: 'COACH_MASTER', // or specific table if known
        operationName: 'Add Coach in Yard',
        entityId: data.coachno,
        getOldData: async () => null,
        getNewData: (result) => result,
        details: `Added coach to yard: ${data.coachno}`
    })
}
