'use server';

import { ENDPOINTS, httpServer } from "@/app/lib/https";
import { ApiActionResponse, handleServerAction } from "@/app/lib/https/serverActionHelpers";
import { unwrapApiResponse } from "@/app/lib/https/utils";

import { UpdateRLiftingDateRequest, UpdateRLiftingDateResponse } from "./types";

import prisma from "@/lib/db/prisma";

export async function updateRLiftingDate(data: UpdateRLiftingDateRequest): Promise<ApiActionResponse<UpdateRLiftingDateResponse>> {
    let oldCoaches: any[] = [];

    return await handleServerAction(async () => {
        // Since there might not be a specific bulk update endpoint for R-Lifting, 
        // we might need to update each coach individually or use a generic bulk update if available.
        // Assuming we can use the master update endpoint for each coach for now, 
        // or if there is a bulk endpoint similar to air brake.
        // However, the air brake action used `ENDPOINTS.COACH.AIR_BRAKE.BULK_UPDATE`.
        // I will assume for now we iterate and update, or if I should use a similar pattern.
        // Let's check if there is a specific endpoint for R-Lifting or if I should just update the master record directly via Prisma or API.
        // The user said "exact reference of air brake operation".
        // Air brake uses `ENDPOINTS.COACH.AIR_BRAKE.BULK_UPDATE`.
        // I don't have that for R-Lifting. I should probably update the master record directly using the API or Prisma if the API doesn't support it.
        // But `handleServerAction` suggests we are calling an external API `httpServer`.
        // If I look at `removeCoachesFromYard`, it iterates and calls `ENDPOINTS.COACH.MASTER.UPDATE`.
        // I will use that pattern since I don't know if a bulk R-Lifting endpoint exists.

        const promises = data.coachNos.map(coachno =>
            httpServer.patch<any>(
                ENDPOINTS.COACH.MASTER.UPDATE(coachno),
                { reliftdt: data.rLiftingDate }
            )
        );

        await Promise.all(promises);

        return {
            success: true,
            message: `Successfully updated R-Lifting date for ${data.coachNos.length} coaches`,
            count: data.coachNos.length
        };

    }, 'updateRLiftingDateAction', {
        action: 'UPDATE',
        entity: 'COACH_MASTER',
        entityId: data.coachNos.join(','),
        getOldData: async () => {
            try {
                const coaches = await (prisma as any).coach_master.findMany({
                    where: {
                        coachno: { in: data.coachNos }
                    }
                });
                oldCoaches = coaches;
                return coaches;
            } catch (error) {
                console.error('Failed to fetch old data:', error);
                return null;
            }
        },
        getNewData: () => {
            if (!oldCoaches || oldCoaches.length === 0) return null;
            return oldCoaches.map(coach => ({
                ...coach,
                reliftdt: data.rLiftingDate
            }));
        },
        details: `Updated R-Lifting Date for coaches: ${data.coachNos.join(', ')}`
    })
}
