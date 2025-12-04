'use server';

import { ENDPOINTS, httpServer } from "@/app/lib/https";
import { ApiActionResponse, handleServerAction } from "@/app/lib/https/serverActionHelpers";
import { unwrapApiResponse } from "@/app/lib/https/utils";

import { UpdateElectricNtxrDatesRequest, UpdateElectricNtxrDatesResponse } from "./types";

import prisma from "@/lib/db/prisma";

export async function updateElectricNtxrDates(data: UpdateElectricNtxrDatesRequest): Promise<ApiActionResponse<UpdateElectricNtxrDatesResponse>> {
    let oldCoaches: any[] = [];

    return await handleServerAction(async () => {
        const promises = data.coachNos.map(coachno => {
            const updateData: any = {};
            if (data.elecracfit !== undefined) updateData.elecracfit = data.elecracfit;
            if (data.ntxrfit !== undefined) updateData.ntxrfit = data.ntxrfit;

            return httpServer.patch<any>(
                ENDPOINTS.COACH.MASTER.UPDATE(coachno),
                updateData
            );
        });

        await Promise.all(promises);

        return {
            success: true,
            message: `Successfully updated Electric and NTXR Fit dates for ${data.coachNos.length} coaches`,
            count: data.coachNos.length
        };

    }, 'updateElectricNtxrDatesAction', {
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
            return oldCoaches.map(coach => {
                const updatedCoach = { ...coach };
                if (data.elecracfit !== undefined) updatedCoach.elecracfit = data.elecracfit;
                if (data.ntxrfit !== undefined) updatedCoach.ntxrfit = data.ntxrfit;
                return updatedCoach;
            });
        },
        details: `Updated Electric and NTXR Fit Dates for coaches: ${data.coachNos.join(', ')}`
    })
}
