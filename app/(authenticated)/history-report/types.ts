import { GenericApiResponse, PaginationMeta } from '@/app/lib/https/types';

export type History = {
    id: string;
    SR_NO: string | null;
    FCOACHNO: string | null;
    OCOACHNO: string | null;
    COACHNO: string | null;
    CODE: string | null;
    MFGDT: Date | null;
    YRBLT: number | null;
    MAKE: string | null;
    BASEDEPOT: string | null;
    REMASTER: string | null;
    TYPE: string | null;
    RAKESING: string | null;
    TWEIGHT: number | null;
    GEN: string | null;
    SPEED: string | null;
    ACNAC: string | null;
    LHBNLHB: string | null;
    AGE: number | null;
    ABOEM: string | null;
    CBC: string | null;
    CBCBY: string | null;
    CBCOEM: string | null;
    COUPLING: string | null;
    CORRMHRS: number | null;
    PERIOD: number | null;
    LSHOPOUTDT: Date | null;
    LPOHBY: string | null;
    RETPOHDT: Date | null;
    AGE_RT_DT: number | null;
    DT_IOH: Date | null;
    RET_DT_IOH: Date | null;
    DUESCH: string | null;
    STATUS: string | null;
    POHBY: string | null;
    YARDINDT: Date | null;
    SHOPINDT: Date | null;
    LOC: string | null;
    SHOP: string | null;
    MECHSUP: string | null;
    LIFTDT: Date | null;
    LOWERDT: Date | null;
    RELIFTDT: Date | null;
    AIRBKDT: Date | null;
    PTINDT: Date | null;
    HPPTOUTDT: Date | null;
    HPPTINDT: Date | null;
    PTOUTDT: Date | null;
    INSHOP_POS: string | null;
    TANKFITOLD: number | null;
    TANKFITNEW: number | null;
    RMPUDT: Date | null;
    CORRSTATUS: string | null;
    BATTERYLD: string | null;
    FANLOAD: string | null;
    LIGHTLOAD: string | null;
    UTKRISHT: string | null;
    LAVUPGRADE: string | null;
    VENTURY: number | null;
    UPHOLSTRY: string | null;
    DYNO: string | null;
    EPOXY: string | null;
    H_CORR: string | null;
    H_CORR_DT: Date | null;
    INISSUE: Date | null;
    REMARK: string | null;
    DATE_COND: Date | null;
    WORKDAYS: number | null;
    CALDAYS: number | null;
    DCWIFIT: Date | null;
    ELECRACFIT: Date | null;
    NTXRFIT: Date | null;
    ISSUEDT: Date | null;
    COND_POS: number | null;
    COND_BY: string | null;
    SERVICE: number | null;
    RSP: string | null;
    C_R: Date | null;
    OTHER_3: string | null;
    COST: number | null;
    FUND: string | null;
    MEMO: string | null;
    SEAT: number | null;
    BERTH: number | null;
    CTYPE: string | null;
    ROAMSDT: Date | null;
    ACME: Date | null;
    INSP_DT: Date | null;
    ROAMSOUTDT: Date | null;
};

export type HistoryReportInfo = {
    items: History[];
    pagination: PaginationMeta;
}

export type HistoryResponse = GenericApiResponse<HistoryReportInfo>

// Search QueryParams
export type HistoryQueryParams = {
    page?: number;
    pageSize?: number;
    coachno?: string;
    status?: string;
    basedepot?: string;
    type?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    filters?: string; // JSON string of FilterCondition[]
};

export const HISTORY_QUERY_KEY = "history-record";
