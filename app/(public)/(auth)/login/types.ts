import { GenericApiResponse } from "@/app/lib/https/types";
import { UserInfo } from "@/app/lib/types";

export type LoginData = {
    access_token: string;
    user: UserInfo
}

export type LoginResponse = GenericApiResponse<LoginData>