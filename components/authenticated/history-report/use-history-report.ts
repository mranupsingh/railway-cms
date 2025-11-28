"use client"

import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { getHistoryData, updateHistory } from "@/app/(authenticated)/history-report/actions";
import { HistoryQueryParams } from "@/app/(authenticated)/history-report/types";
import { toast } from "sonner";

export const HISTORY_QUERY_KEY = "history";

export function useHistory(params: HistoryQueryParams = {}) {
    return useQuery({
        queryKey: [HISTORY_QUERY_KEY, params],
        queryFn: async () => {
            const result = await getHistoryData(params);
            if (!result.success) {
                throw new Error(result.error);
            }
            return result.data;
        },
        placeholderData: keepPreviousData,
    });
}

export function useUpdateHistory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<any> }) => {
            const result = await updateHistory(id, data);
            if (!result.success) {
                throw new Error(result.error);
            }
            return result.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [HISTORY_QUERY_KEY] });
            toast.success("History record updated successfully");
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to update history record");
        },
    });
}
