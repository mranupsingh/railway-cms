import { GenericApiResponse } from "@/app/lib/https/types";

export interface AuditLog {
    id: string;
    user_id: string;
    action: string;
    entity: string;
    entity_id: string;
    old_data: any;
    new_data: any;
    details: string | null;
    created_at: Date;
}

export interface AuditLogQueryParams {
    page?: number;
    pageSize?: number;
    userId?: string;
    action?: string;
    entity?: string;
    startDate?: string;
    endDate?: string;
}

export interface AuditLogResponseData {
    items: AuditLog[];
    pagination: {
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    };
}

export type AuditLogResponse = GenericApiResponse<AuditLogResponseData>;
