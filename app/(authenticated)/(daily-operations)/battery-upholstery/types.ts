export type UpdateBatteryUpholsteryRequest = {
    coachNos: string[];
    batteryld?: string;
    upholstry?: string;
}

export type UpdateBatteryUpholsteryResponse = {
    success: boolean;
    message: string;
    count: number;
}
