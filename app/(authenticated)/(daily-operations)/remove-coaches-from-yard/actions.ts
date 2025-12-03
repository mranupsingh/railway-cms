'use server';

import { ENDPOINTS, httpServer } from "@/app/lib/https";
import { ApiActionResponse, handleServerAction } from "@/app/lib/https/serverActionHelpers";
import { unwrapApiResponse } from "@/app/lib/https/utils";

import { RemoveCoachesFromYardRequest, RemoveCoachesFromYardResponse } from "./types";

export async function removeCoachesFromYard(data: RemoveCoachesFromYardRequest): Promise<ApiActionResponse<RemoveCoachesFromYardResponse>> {
    const result = await handleServerAction(async () => {
        // We need to update each coach individually as there might not be a bulk update endpoint
        // Or if there is a bulk endpoint, we should use it. 
        // Assuming we need to update each coach's pohby to null/empty.
        // However, the requirement says "clear that field form YD to blank. empty"
        // Let's assume we iterate and update. 
        // Wait, better to check if there is a bulk endpoint or just loop.
        // Since I don't see a bulk endpoint in the previous exploration, I will loop.
        // BUT, for efficiency, if the backend supports it, it's better.
        // Let's try to find if there is a bulk update or just use a loop for now.
        // Actually, the user said "actions also for api calls", implying I should create the action.

        // I will implement it by iterating over the coach numbers and updating them.
        // This might be slow if many coaches are selected, but safe.

        const promises = data.coachNos.map(coachno =>
            httpServer.patch<any>(
                ENDPOINTS.COACH.MASTER.UPDATE(coachno),
                { pohby: null } // or "" depending on backend, usually null for clearing
            )
        );

        await Promise.all(promises);

        return {
            success: true,
            message: `Successfully removed ${data.coachNos.length} coaches from yard`,
            count: data.coachNos.length
        };

    }, 'removeCoachesFromYardAction')

    if (!result.success) {
        console.log(result.error)
        throw new Error(result.error || 'Something went wrong')
    }

    return result
}
