export interface UpdateLiftingReportRequest {
    coachno: string;
    insp_dt?: Date | null;
    corrstatus?: string | null;
    remark?: string | null;
}

export interface UpdateLiftingReportResponse {
    success: boolean;
    message: string;
}
