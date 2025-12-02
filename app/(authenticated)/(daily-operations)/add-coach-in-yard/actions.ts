'use server';

import { ENDPOINTS, httpServer } from "@/app/lib/https";
import { ApiActionResponse, handleServerAction } from "@/app/lib/https/serverActionHelpers";
import { unwrapApiResponse } from "@/app/lib/https/utils";

import { AddCoachInYardRequest, AddCoachInYardResponse } from "./types";

export async function addCoachToYard(data: AddCoachInYardRequest): Promise<ApiActionResponse<AddCoachInYardResponse>> {
    const result = await handleServerAction(async () => {
        const response = await httpServer.post<AddCoachInYardResponse>(
            ENDPOINTS.COACH.YARD.ADD,
            data
        );

        return unwrapApiResponse<AddCoachInYardResponse>(response)
    }, 'addCoachToYardAction')

    if (!result.success) {
        console.log(result.error)
        throw new Error(result.error || 'Something went wrong')
    }

    return result
}
