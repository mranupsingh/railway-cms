export interface UpdateRLiftingDateRequest {
    coachNos: string[];
    rLiftingDate: Date;
}

export interface UpdateRLiftingDateResponse {
    success: boolean;
    message: string;
    count: number;
}
