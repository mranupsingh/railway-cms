'use server';

import { ApiActionResponse, handleServerAction } from "@/app/lib/https/serverActionHelpers";
import prisma from "@/lib/db/prisma";
import { AuditLogQueryParams, AuditLogResponseData } from "./types";

export async function getAuditLogs(params: AuditLogQueryParams = {}): Promise<ApiActionResponse<AuditLogResponseData>> {
    return await handleServerAction(async () => {
        const page = params.page || 1;
        const pageSize = params.pageSize || 20;
        const skip = (page - 1) * pageSize;

        const where: any = {};

        if (params.userId) {
            where.user_id = { contains: params.userId, mode: 'insensitive' };
        }
        if (params.action) {
            where.action = { equals: params.action };
        }
        if (params.entity) {
            where.entity = { contains: params.entity, mode: 'insensitive' };
        }
        if (params.startDate && params.endDate) {
            where.created_at = {
                gte: new Date(params.startDate),
                lte: new Date(params.endDate)
            };
        } else if (params.startDate) {
            where.created_at = { gte: new Date(params.startDate) };
        } else if (params.endDate) {
            where.created_at = { lte: new Date(params.endDate) };
        }

        const [total, items] = await Promise.all([
            (prisma as any).user_activity_logs.count({ where }),
            (prisma as any).user_activity_logs.findMany({
                where,
                orderBy: { created_at: 'desc' },
                skip,
                take: pageSize,
            })
        ]);

        return {
            items,
            pagination: {
                total,
                page,
                pageSize,
                totalPages: Math.ceil(total / pageSize),
            }
        };

    }, 'getAuditLogsAction');
}
