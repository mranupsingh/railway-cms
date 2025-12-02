import { GenericApiResponse } from '@/app/lib/https/types';
import { Prisma } from '@prisma/client';

export type UpdateAirBrakeDateRequest = {
    coachNos: string[];
    airBrakeDate: Date | string;
};

export type UpdateAirBrakeDateResponse = GenericApiResponse<Prisma.BatchPayload>;
