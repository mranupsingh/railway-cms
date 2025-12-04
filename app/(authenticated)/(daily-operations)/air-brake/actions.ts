'use server';

import { ENDPOINTS, httpServer } from "@/app/lib/https";
import { ApiActionResponse, handleServerAction } from "@/app/lib/https/serverActionHelpers";
import { unwrapApiResponse } from "@/app/lib/https/utils";

import { UpdateAirBrakeDateRequest, UpdateAirBrakeDateResponse } from "./types";

import prisma from "@/lib/db/prisma";

export async function updateAirBrakeDate(data: UpdateAirBrakeDateRequest): Promise<ApiActionResponse<UpdateAirBrakeDateResponse>> {
    let oldCoaches: any[] = [];

    return await handleServerAction(async () => {
        const response = await httpServer.post<UpdateAirBrakeDateResponse>(
            ENDPOINTS.COACH.AIR_BRAKE.BULK_UPDATE,
            data
        );

        return unwrapApiResponse<UpdateAirBrakeDateResponse>(response)
    }, 'updateAirBrakeDateAction', {
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
                airbkdt: data.airBrakeDate
            }));
        },
        details: `Updated Air Brake Date for coaches: ${data.coachNos.join(', ')}`
    })
}
