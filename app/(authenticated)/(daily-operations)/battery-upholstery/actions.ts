'use server';

import { ENDPOINTS, httpServer } from "@/app/lib/https";
import { ApiActionResponse, handleServerAction } from "@/app/lib/https/serverActionHelpers";

import { UpdateBatteryUpholsteryRequest, UpdateBatteryUpholsteryResponse } from "./types";

import prisma from "@/lib/db/prisma";

export async function updateBatteryUpholsteryStatus(data: UpdateBatteryUpholsteryRequest): Promise<ApiActionResponse<UpdateBatteryUpholsteryResponse>> {
    let oldCoaches: any[] = [];

    return await handleServerAction(async () => {
        const promises = data.coachNos.map(coachno => {
            const updateData: any = {};
            if (data.batteryld !== undefined) updateData.batteryld = data.batteryld;
            if (data.upholstry !== undefined) updateData.upholstry = data.upholstry;

            return httpServer.patch<any>(
                ENDPOINTS.COACH.MASTER.UPDATE(coachno),
                updateData
            );
        });

        await Promise.all(promises);

        return {
            success: true,
            message: `Successfully updated Battery/Upholstery status for ${data.coachNos.length} coaches`,
            count: data.coachNos.length
        };

    }, 'updateBatteryUpholsteryStatus', {
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
                if (data.batteryld !== undefined) updatedCoach.batteryld = data.batteryld;
                if (data.upholstry !== undefined) updatedCoach.upholstry = data.upholstry;
                return updatedCoach;
            });
        },
        details: `Updated Battery/Upholstery Status for coaches: ${data.coachNos.join(', ')}`
    })
}
