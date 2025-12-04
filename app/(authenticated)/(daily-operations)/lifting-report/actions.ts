'use server';

import { ENDPOINTS, httpServer } from "@/app/lib/https";
import { ApiActionResponse, handleServerAction } from "@/app/lib/https/serverActionHelpers";

import { UpdateLiftingReportRequest, UpdateLiftingReportResponse } from "./types";

import prisma from "@/lib/db/prisma";

export async function updateLiftingReport(data: UpdateLiftingReportRequest): Promise<ApiActionResponse<UpdateLiftingReportResponse>> {
    let oldCoach: any = null;

    return await handleServerAction(async () => {
        const updateData: any = {};
        if (data.insp_dt !== undefined) updateData.insp_dt = data.insp_dt;
        if (data.corrstatus !== undefined) updateData.corrstatus = data.corrstatus;
        if (data.remark !== undefined) updateData.remark = data.remark;

        await httpServer.patch<any>(
            ENDPOINTS.COACH.MASTER.UPDATE(data.coachno),
            updateData
        );

        return {
            success: true,
            message: `Successfully updated Lifting Report for coach ${data.coachno}`
        };

    }, 'updateLiftingReportAction', {
        action: 'UPDATE',
        entity: 'COACH_MASTER',
        entityId: data.coachno,
        getOldData: async () => {
            try {
                const coach = await (prisma as any).coach_master.findUnique({
                    where: {
                        coachno: data.coachno
                    }
                });
                oldCoach = coach;
                return coach;
            } catch (error) {
                console.error('Failed to fetch old data:', error);
                return null;
            }
        },
        getNewData: () => {
            if (!oldCoach) return null;
            const updatedCoach = { ...oldCoach };
            if (data.insp_dt !== undefined) updatedCoach.insp_dt = data.insp_dt;
            if (data.corrstatus !== undefined) updatedCoach.corrstatus = data.corrstatus;
            if (data.remark !== undefined) updatedCoach.remark = data.remark;
            return updatedCoach;
        },
        details: `Updated Lifting Report for coach: ${data.coachno}`
    })
}
