import { getCoachMasterData, updateCoachMaster } from '@/app/(authenticated)/master-report/actions';
import { CoachMasterQueryParams } from '@/app/(authenticated)/master-report/types';
import { showToast } from '@/components/ui/sonner';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const COACH_MASTER_QUERY_KEY = 'coach-master';

export function useCoachMaster(params: CoachMasterQueryParams = {}) {
    return useQuery({
        queryKey: [COACH_MASTER_QUERY_KEY, params],
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
            queryClient.invalidateQueries({ queryKey: [COACH_MASTER_QUERY_KEY] });
            showToast('Coach updated successfully', { variant: 'success' });
        },
        onError: (error) => {
            showToast(error.message, { variant: 'error' });
        },
    });
}
