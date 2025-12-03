export interface RemoveCoachesFromYardRequest {
    coachNos: string[];
}

export interface RemoveCoachesFromYardResponse {
    success: boolean;
    message: string;
    count: number;
}
