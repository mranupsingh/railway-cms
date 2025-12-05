export interface RemoveCoachesFromYardRequest {
    coaches: {
        coachno: string;
        remark?: string;
    }[];
}

export interface RemoveCoachesFromYardResponse {
    success: boolean;
    message: string;
    count: number;
}
