'use server';

import { ENDPOINTS, httpServer } from "@/app/lib/https";
import { ApiActionResponse, handleServerAction } from "@/app/lib/https/serverActionHelpers";
import { unwrapApiResponse } from "@/app/lib/https/utils";

import { RemoveCoachesFromYardRequest, RemoveCoachesFromYardResponse } from "./types";

import prisma from "@/lib/db/prisma";

export async function removeCoachesFromYard(data: RemoveCoachesFromYardRequest): Promise<ApiActionResponse<RemoveCoachesFromYardResponse>> {
    let oldCoaches: any[] = [];

    return await handleServerAction(async () => {
        const promises = data.coaches.map(coach =>
            httpServer.patch<any>(
                ENDPOINTS.COACH.MASTER.UPDATE(coach.coachno),
                {
                    pohby: null,
                    remark: coach.remark || null
                }
            )
        );

        await Promise.all(promises);

        return {
            success: true,
            message: `Successfully removed ${data.coaches.length} coaches from yard`,
            count: data.coaches.length
        };

    }, 'removeCoachesFromYardAction', {
        action: 'UPDATE',
        entity: 'COACH_MASTER',
        operationName: 'Remove Coach from Yard',
        entityId: data.coaches.map(c => c.coachno).join(','),
        getOldData: async () => {
            try {
                const coachNos = data.coaches.map(c => c.coachno);
                const coaches = await (prisma as any).coach_master.findMany({
                    where: {
                        coachno: { in: coachNos }
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
            return oldCoaches.map(coach => {
                const newCoachData = data.coaches.find(c => c.coachno === coach.coachno);
                return {
                    ...coach,
                    pohby: null,
                    remark: newCoachData?.remark || null
                };
            });
        },
        details: `Removed coaches from yard: ${data.coaches.map(c => c.coachno).join(', ')}`
    })
}
