export interface UpdateBioTankDatesRequest {
    coachNos: string[];
    btundt?: Date | null;
    btlddt?: Date | null;
}

export interface UpdateBioTankDatesResponse {
    success: boolean;
    message: string;
    count: number;
}
