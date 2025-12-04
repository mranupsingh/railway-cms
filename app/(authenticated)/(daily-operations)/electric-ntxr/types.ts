export interface UpdateElectricNtxrDatesRequest {
    coachNos: string[];
    elecracfit?: Date | null;
    ntxrfit?: Date | null;
}

export interface UpdateElectricNtxrDatesResponse {
    success: boolean;
    message: string;
    count: number;
}
