'use client';

import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Loader2, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { getCoachMasterData } from '@/app/(authenticated)/master-record/actions';
import { removeCoachesFromYard } from '@/app/(authenticated)/(daily-operations)/remove-coaches-from-yard/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SearchableSelect } from '@/components/ui/searchable-select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

export default function RemoveCoachFromYard() {
    const [selectedCoaches, setSelectedCoaches] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const queryClient = useQueryClient();

    // Fetch coaches in yard (pohby = 'YD')
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading: isLoadingCoaches
    } = useInfiniteQuery({
        queryKey: ['coaches-in-yard-to-remove', searchTerm],
        queryFn: async ({ pageParam = 1 }) => {
            const filters: any[] = [{ column: 'pohby', operator: 'equals', value: 'YD' }];

            const response = await getCoachMasterData({
                filters: JSON.stringify(filters),
                page: pageParam,
                pageSize: 20,
                coachno: searchTerm || undefined,
            });

            if (!response.success) throw new Error(response.error);
            return response.data;
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            if (!lastPage?.pagination) return undefined;
            const { page, totalPages } = lastPage.pagination;
            return page < totalPages ? page + 1 : undefined;
        },
    });

    const coachOptions = useMemo(() => {
        const coaches = data?.pages.flatMap(page => page?.items || []) || [];
        return coaches.map(c => ({
            value: c.coachno,
            label: c.coachno,
            original: c
        }));
    }, [data]);

    const handleSelectCoach = (coachno: string) => {
        const selectedOption = coachOptions.find(opt => opt.value === coachno);
        if (selectedOption) {
            const coach = selectedOption.original;
            // Toggle selection
            if (selectedCoaches.find(c => c.coachno === coach.coachno)) {
                setSelectedCoaches(selectedCoaches.filter(c => c.coachno !== coachno));
            } else {
                setSelectedCoaches([...selectedCoaches, coach]);
            }
        }
    };

    const handleRemoveCoach = (coachno: string) => {
        setSelectedCoaches(selectedCoaches.filter(c => c.coachno !== coachno));
    };

    const mutation = useMutation({
        mutationFn: async () => {
            const response = await removeCoachesFromYard({
                coachNos: selectedCoaches.map(c => c.coachno)
            });
            if (!response.success) throw new Error(response.error);
            return response;
        },
        onSuccess: (data) => {
            toast.success(data.data?.message || 'Coaches removed from yard successfully');
            setSelectedCoaches([]);
            queryClient.invalidateQueries({ queryKey: ['coaches-in-yard-to-remove'] });
        },
        onError: (error) => {
            toast.error(`Failed to remove coaches: ${error.message}`);
        },
    });

    const handleSave = () => {
        if (selectedCoaches.length === 0) {
            toast.error('Please select at least one coach');
            return;
        }
        mutation.mutate();
    };

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Remove Coaches from Yard</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column: Controls */}
                <div className="md:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Select Coaches</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Add Coach</label>
                                <SearchableSelect
                                    value=""
                                    onValueChange={handleSelectCoach}
                                    options={coachOptions}
                                    onSearch={setSearchTerm}
                                    onLoadMore={fetchNextPage}
                                    hasMore={hasNextPage}
                                    isLoading={isLoadingCoaches || isFetchingNextPage}
                                    placeholder="Select coach..."
                                    searchPlaceholder="Search coach number..."
                                    keepOpenOnSelect={true}
                                    selectedValues={selectedCoaches.map(c => c.coachno)}
                                />
                            </div>

                            <Button
                                className="w-full"
                                variant="destructive"
                                onClick={handleSave}
                                disabled={selectedCoaches.length === 0 || mutation.isPending}
                            >
                                {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Remove Coaches from Yard
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Selected Coaches Table */}
                <div className="md:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Selected Coaches ({selectedCoaches.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Coach No</TableHead>
                                            <TableHead>Code</TableHead>
                                            <TableHead>Return POH Date</TableHead>
                                            <TableHead>POH Date</TableHead>
                                            <TableHead>POH By</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="w-[50px]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {selectedCoaches.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="h-24 text-center">
                                                    No coaches selected.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            selectedCoaches.map((coach) => (
                                                <TableRow key={coach.coachno}>
                                                    <TableCell className="font-medium">{coach.coachno}</TableCell>
                                                    <TableCell>{coach.code}</TableCell>
                                                    <TableCell>{coach.retpohdt ? format(new Date(coach.retpohdt), 'dd/MM/yyyy') : '-'}</TableCell>
                                                    <TableCell>
                                                        {coach.lshopoutdt ? format(new Date(coach.lshopoutdt), 'dd/MM/yyyy') : '-'}
                                                    </TableCell>
                                                    <TableCell>{coach.pohby}</TableCell>
                                                    <TableCell>{coach.status}</TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleRemoveCoach(coach.coachno)}
                                                            className="text-destructive hover:text-destructive/90"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
