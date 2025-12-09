'use server';

import { ENDPOINTS, httpServer } from "@/app/lib/https";
import { ApiActionResponse, handleServerAction } from "@/app/lib/https/serverActionHelpers";
import { unwrapApiResponse } from "@/app/lib/https/utils";

import { UpdateBioTankDatesRequest, UpdateBioTankDatesResponse } from "./types";

import prisma from "@/lib/db/prisma";

export async function updateBioTankDates(data: UpdateBioTankDatesRequest): Promise<ApiActionResponse<UpdateBioTankDatesResponse>> {
    let oldCoaches: any[] = [];

    return await handleServerAction(async () => {
        const promises = data.coachNos.map(coachno => {
            const updateData: any = {};
            if (data.btundt !== undefined) updateData.btundt = data.btundt;
            if (data.btlddt !== undefined) updateData.btlddt = data.btlddt;

            return httpServer.patch<any>(
                ENDPOINTS.COACH.MASTER.UPDATE(coachno),
                updateData
            );
        });

        await Promise.all(promises);

        return {
            success: true,
            message: `Successfully updated Bio-tank dates for ${data.coachNos.length} coaches`,
            count: data.coachNos.length
        };

    }, 'updateBioTankDatesAction', {
        action: 'UPDATE',
        entity: 'COACH_MASTER',
        operationName: 'Update Bio Tank Dates',
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
            return oldCoaches.map(coach => {
                const updatedCoach = { ...coach };
                if (data.btundt !== undefined) updatedCoach.btundt = data.btundt;
                if (data.btlddt !== undefined) updatedCoach.btlddt = data.btlddt;
                return updatedCoach;
            });
        },
        details: `Updated Bio-tank Dates for coaches: ${data.coachNos.join(', ')}`
    })
}
