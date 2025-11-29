import { getCoachMasterData, updateCoachMaster } from '@/app/(authenticated)/master-record/actions';
import { CoachMasterQueryParams, MASTER_RECORD_QUERY_KEY } from '@/app/(authenticated)/master-record/types';
import { showToast } from '@/components/ui/sonner';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useMasterRecord(params: CoachMasterQueryParams = {}) {
    return useQuery({
        queryKey: [MASTER_RECORD_QUERY_KEY, params],
        queryFn: async () => {
            const result = await getCoachMasterData(params);

            if (!result.success) {
                showToast(result.error, { variant: 'error' })
                throw new Error(result.error)
            }

            return result.data
        },
        placeholderData: keepPreviousData,
    });
}

export function useUpdateCoachMaster() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ coachno, data }: { coachno: string; data: any }) => {
            const result = await updateCoachMaster(coachno, data);
            if (!result.success) {
                throw new Error(result.error);
            }
            return result.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [MASTER_RECORD_QUERY_KEY] });
            showToast('Coach updated successfully', { variant: 'success' });
        },
        onError: (error) => {
            showToast(error.message, { variant: 'error' });
        },
    });
}
