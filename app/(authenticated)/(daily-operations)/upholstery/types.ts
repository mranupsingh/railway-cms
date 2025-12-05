export interface UpdateUpholsteryDatesRequest {
    coachNos: string[];
    uphundt?: Date | null;
    uphlddt?: Date | null;
}

export interface UpdateUpholsteryDatesResponse {
    success: boolean;
    message: string;
    count: number;
}
