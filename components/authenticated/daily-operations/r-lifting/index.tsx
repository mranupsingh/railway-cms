'use client';

import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { CalendarIcon, Loader2, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { getCoachMasterData } from '@/app/(authenticated)/master-record/actions';
import { updateRLiftingDate } from '@/app/(authenticated)/(daily-operations)/r-lifting/actions';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { SearchableSelect } from '@/components/ui/searchable-select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

export default function RLifting() {
    const [selectedCoaches, setSelectedCoaches] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [rLiftingDate, setRLiftingDate] = useState<Date>(new Date());
    const queryClient = useQueryClient();

    // Fetch coaches with infinite scroll
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading: isLoadingCoaches
    } = useInfiniteQuery({
        queryKey: ['coaches-for-r-lifting', searchTerm],
        queryFn: async ({ pageParam = 1 }) => {
            const filters: any[] = [
                { column: 'pohby', operator: 'equals', value: 'PL' }
            ];

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

    // Flatten data for the dropdown
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

    // Mutation for saving data
    const mutation = useMutation({
        mutationFn: async () => {
            const response = await updateRLiftingDate({
                coachNos: selectedCoaches.map(c => c.coachno),
                rLiftingDate: rLiftingDate
            });
            if (!response.success) throw new Error(response.error);
            return response;
        },
        onSuccess: (data: any) => {
            toast.success(data.message || 'R-Lifting date updated successfully');
            setSelectedCoaches([]);
            setRLiftingDate(new Date());
            queryClient.invalidateQueries({ queryKey: ['coaches-for-r-lifting'] });
        },
        onError: (error) => {
            toast.error(`Failed to save: ${error.message}`);
        },
    });

    const handleSave = () => {
        if (selectedCoaches.length === 0) {
            toast.error('Please select at least one coach');
            return;
        }
        if (!rLiftingDate) {
            toast.error('Please select a R-Lifting date');
            return;
        }
        mutation.mutate();
    };

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">R-Lifting Update</h1>
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

                            <div className="space-y-2">
                                <label className="text-sm font-medium">R-Lifting Date</label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full pl-3 text-left font-normal",
                                                !rLiftingDate && "text-muted-foreground"
                                            )}
                                        >
                                            {rLiftingDate ? (
                                                format(rLiftingDate, "PPP")
                                            ) : (
                                                <span>Pick a date</span>
                                            )}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={rLiftingDate}
                                            onSelect={(date) => date && setRLiftingDate(date)}
                                            disabled={(date) =>
                                                date > new Date() || date < new Date("1900-01-01")
                                            }
                                            initialFocus
                                            required
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <Button
                                className="w-full"
                                onClick={handleSave}
                                disabled={selectedCoaches.length === 0 || !rLiftingDate || mutation.isPending}
                            >
                                {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Updates
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
                                            <TableHead>Old R-Lifting Date</TableHead>
                                            <TableHead>New R-Lifting Date</TableHead>
                                            <TableHead className="w-[50px]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {selectedCoaches.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="h-24 text-center">
                                                    No coaches selected.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            selectedCoaches.map((coach) => (
                                                <TableRow key={coach.coachno}>
                                                    <TableCell className="font-medium">{coach.coachno}</TableCell>
                                                    <TableCell>{coach.code}</TableCell>
                                                    <TableCell>
                                                        {coach.reliftdt ? format(new Date(coach.reliftdt), 'dd/MM/yyyy') : '-'}
                                                    </TableCell>
                                                    <TableCell className="text-green-600 font-medium">
                                                        {rLiftingDate ? format(rLiftingDate, 'dd/MM/yyyy') : '-'}
                                                    </TableCell>
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
