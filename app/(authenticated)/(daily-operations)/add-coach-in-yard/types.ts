import { GenericApiResponse } from '@/app/lib/https/types';
import { CoachMaster } from '@/app/(authenticated)/master-record/types';

export type AddCoachInYardRequest = {
    coachno: string;
    yardindt?: Date | string;
    pohby?: string;
    status?: string;
    remark?: string;
    remaster?: string;
    duesch?: string;
    lschedule?: string;
};

export type AddCoachInYardResponse = GenericApiResponse<CoachMaster>;
