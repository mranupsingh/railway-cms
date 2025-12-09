'use server';

import { ENDPOINTS, httpServer } from "@/app/lib/https";
import { ApiActionResponse, handleServerAction } from "@/app/lib/https/serverActionHelpers";
import { unwrapApiResponse } from "@/app/lib/https/utils";

import { UpdateUpholsteryDatesRequest, UpdateUpholsteryDatesResponse } from "./types";

import prisma from "@/lib/db/prisma";

export async function updateUpholsteryDates(data: UpdateUpholsteryDatesRequest): Promise<ApiActionResponse<UpdateUpholsteryDatesResponse>> {
    let oldCoaches: any[] = [];

    return await handleServerAction(async () => {
        const promises = data.coachNos.map(coachno => {
            const updateData: any = {};
            if (data.uphundt !== undefined) updateData.uphundt = data.uphundt;
            if (data.uphlddt !== undefined) updateData.uphlddt = data.uphlddt;

            return httpServer.patch<any>(
                ENDPOINTS.COACH.MASTER.UPDATE(coachno),
                updateData
            );
        });

        await Promise.all(promises);

        return {
            success: true,
            message: `Successfully updated Upholstery dates for ${data.coachNos.length} coaches`,
            count: data.coachNos.length
        };

    }, 'updateUpholsteryDatesAction', {
        action: 'UPDATE',
        entity: 'COACH_MASTER',
        operationName: 'Update Upholstery Dates',
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
                if (data.uphundt !== undefined) updatedCoach.uphundt = data.uphundt;
                if (data.uphlddt !== undefined) updatedCoach.uphlddt = data.uphlddt;
                return updatedCoach;
            });
        },
        details: `Updated Upholstery Dates for coaches: ${data.coachNos.join(', ')}`
    })
}
