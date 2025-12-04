'use client';

import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { CalendarIcon, Loader2, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { getCoachMasterData } from '@/app/(authenticated)/master-record/actions';
import { updateElectricNtxrDates } from '@/app/(authenticated)/(daily-operations)/electric-ntxr/actions';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from '@/lib/utils';

export default function ElectricNtxr() {
    const [selectedCoachesElectric, setSelectedCoachesElectric] = useState<any[]>([]);
    const [selectedCoachesNtxr, setSelectedCoachesNtxr] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [electricDate, setElectricDate] = useState<Date | undefined>(undefined);
    const [ntxrDate, setNtxrDate] = useState<Date | undefined>(undefined);
    const queryClient = useQueryClient();

    // Fetch coaches with infinite scroll
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading: isLoadingCoaches
    } = useInfiniteQuery({
        queryKey: ['coaches-for-electric-ntxr', searchTerm],
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

    const handleSelectCoachElectric = (coachno: string) => {
        const selectedOption = coachOptions.find(opt => opt.value === coachno);
        if (selectedOption) {
            const coach = selectedOption.original;
            if (selectedCoachesElectric.find(c => c.coachno === coach.coachno)) {
                setSelectedCoachesElectric(selectedCoachesElectric.filter(c => c.coachno !== coachno));
            } else {
                setSelectedCoachesElectric([...selectedCoachesElectric, coach]);
            }
        }
    };

    const handleSelectCoachNtxr = (coachno: string) => {
        const selectedOption = coachOptions.find(opt => opt.value === coachno);
        if (selectedOption) {
            const coach = selectedOption.original;
            if (selectedCoachesNtxr.find(c => c.coachno === coach.coachno)) {
                setSelectedCoachesNtxr(selectedCoachesNtxr.filter(c => c.coachno !== coachno));
            } else {
                setSelectedCoachesNtxr([...selectedCoachesNtxr, coach]);
            }
        }
    };

    const handleRemoveCoachElectric = (coachno: string) => {
        setSelectedCoachesElectric(selectedCoachesElectric.filter(c => c.coachno !== coachno));
    };

    const handleRemoveCoachNtxr = (coachno: string) => {
        setSelectedCoachesNtxr(selectedCoachesNtxr.filter(c => c.coachno !== coachno));
    };

    // Mutation for saving data
    const mutation = useMutation({
        mutationFn: async (data: { coaches: string[], elecracfit?: Date, ntxrfit?: Date }) => {
            const response = await updateElectricNtxrDates({
                coachNos: data.coaches,
                elecracfit: data.elecracfit,
                ntxrfit: data.ntxrfit
            });
            if (!response.success) throw new Error(response.error);
            return response;
        },
        onSuccess: (data: any) => {
            toast.success(data.message || 'Dates updated successfully');
            setSelectedCoachesElectric([]);
            setSelectedCoachesNtxr([]);
            setElectricDate(undefined);
            setNtxrDate(undefined);
            queryClient.invalidateQueries({ queryKey: ['coaches-for-electric-ntxr'] });
        },
        onError: (error) => {
            toast.error(`Failed to save: ${error.message}`);
        },
    });

    const handleSaveElectric = () => {
        if (selectedCoachesElectric.length === 0) {
            toast.error('Please select at least one coach');
            return;
        }
        if (!electricDate) {
            toast.error('Please select an Electric Fit date');
            return;
        }
        // Adjust date to noon to avoid timezone issues when converting to UTC
        const adjustedDate = new Date(electricDate);
        adjustedDate.setHours(12);
        mutation.mutate({ coaches: selectedCoachesElectric.map(c => c.coachno), elecracfit: adjustedDate });
    };

    const handleSaveNtxr = () => {
        if (selectedCoachesNtxr.length === 0) {
            toast.error('Please select at least one coach');
            return;
        }
        if (!ntxrDate) {
            toast.error('Please select an NTXR Fit date');
            return;
        }
        // Adjust date to noon to avoid timezone issues when converting to UTC
        const adjustedDate = new Date(ntxrDate);
        adjustedDate.setHours(12);
        mutation.mutate({ coaches: selectedCoachesNtxr.map(c => c.coachno), ntxrfit: adjustedDate });
    };

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Electric and NTXR Fit</h1>
            </div>

            <Tabs defaultValue="electric" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="electric">Electric Fit</TabsTrigger>
                    <TabsTrigger value="ntxr">NTXR Fit</TabsTrigger>
                </TabsList>

                <TabsContent value="electric">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                        {/* Left Column: Controls */}
                        <div className="md:col-span-1 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Electric Fit - Select Coaches</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Add Coach</label>
                                        <SearchableSelect
                                            value=""
                                            onValueChange={handleSelectCoachElectric}
                                            options={coachOptions}
                                            onSearch={setSearchTerm}
                                            onLoadMore={fetchNextPage}
                                            hasMore={hasNextPage}
                                            isLoading={isLoadingCoaches || isFetchingNextPage}
                                            placeholder="Select coach..."
                                            searchPlaceholder="Search coach number..."
                                            keepOpenOnSelect={true}
                                            selectedValues={selectedCoachesElectric.map(c => c.coachno)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Electric Fit Date</label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full pl-3 text-left font-normal",
                                                        !electricDate && "text-muted-foreground"
                                                    )}
                                                >
                                                    {electricDate ? (
                                                        format(electricDate, "PPP")
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={electricDate}
                                                    onSelect={setElectricDate}
                                                    disabled={(date) =>
                                                        date > new Date() || date < new Date("1900-01-01")
                                                    }
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                    <Button
                                        className="w-full"
                                        onClick={handleSaveElectric}
                                        disabled={selectedCoachesElectric.length === 0 || !electricDate || mutation.isPending}
                                    >
                                        {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Save Electric Fit Updates
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column: Selected Coaches Table */}
                        <div className="md:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Selected Coaches ({selectedCoachesElectric.length})</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Coach No</TableHead>
                                                    <TableHead>Code</TableHead>
                                                    <TableHead>Current Electric Fit Date</TableHead>
                                                    <TableHead>New Electric Fit Date</TableHead>
                                                    <TableHead className="w-[50px]"></TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {selectedCoachesElectric.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={5} className="h-24 text-center">
                                                            No coaches selected.
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    selectedCoachesElectric.map((coach) => (
                                                        <TableRow key={coach.coachno}>
                                                            <TableCell className="font-medium">{coach.coachno}</TableCell>
                                                            <TableCell>{coach.code}</TableCell>
                                                            <TableCell>
                                                                {coach.elecracfit ? format(new Date(coach.elecracfit), 'dd/MM/yyyy') : '-'}
                                                            </TableCell>
                                                            <TableCell className="text-green-600 font-medium">
                                                                {electricDate ? format(electricDate, 'dd/MM/yyyy') : '-'}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => handleRemoveCoachElectric(coach.coachno)}
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
                </TabsContent>

                <TabsContent value="ntxr">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                        {/* Left Column: Controls */}
                        <div className="md:col-span-1 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>NTXR Fit - Select Coaches</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Add Coach</label>
                                        <SearchableSelect
                                            value=""
                                            onValueChange={handleSelectCoachNtxr}
                                            options={coachOptions}
                                            onSearch={setSearchTerm}
                                            onLoadMore={fetchNextPage}
                                            hasMore={hasNextPage}
                                            isLoading={isLoadingCoaches || isFetchingNextPage}
                                            placeholder="Select coach..."
                                            searchPlaceholder="Search coach number..."
                                            keepOpenOnSelect={true}
                                            selectedValues={selectedCoachesNtxr.map(c => c.coachno)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">NTXR Fit Date</label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full pl-3 text-left font-normal",
                                                        !ntxrDate && "text-muted-foreground"
                                                    )}
                                                >
                                                    {ntxrDate ? (
                                                        format(ntxrDate, "PPP")
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={ntxrDate}
                                                    onSelect={setNtxrDate}
                                                    disabled={(date) =>
                                                        date > new Date() || date < new Date("1900-01-01")
                                                    }
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                    <Button
                                        className="w-full"
                                        onClick={handleSaveNtxr}
                                        disabled={selectedCoachesNtxr.length === 0 || !ntxrDate || mutation.isPending}
                                    >
                                        {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Save NTXR Fit Updates
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column: Selected Coaches Table */}
                        <div className="md:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Selected Coaches ({selectedCoachesNtxr.length})</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Coach No</TableHead>
                                                    <TableHead>Code</TableHead>
                                                    <TableHead>Current NTXR Fit Date</TableHead>
                                                    <TableHead>New NTXR Fit Date</TableHead>
                                                    <TableHead className="w-[50px]"></TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {selectedCoachesNtxr.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={5} className="h-24 text-center">
                                                            No coaches selected.
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    selectedCoachesNtxr.map((coach) => (
                                                        <TableRow key={coach.coachno}>
                                                            <TableCell className="font-medium">{coach.coachno}</TableCell>
                                                            <TableCell>{coach.code}</TableCell>
                                                            <TableCell>
                                                                {coach.ntxrfit ? format(new Date(coach.ntxrfit), 'dd/MM/yyyy') : '-'}
                                                            </TableCell>
                                                            <TableCell className="text-green-600 font-medium">
                                                                {ntxrDate ? format(ntxrDate, 'dd/MM/yyyy') : '-'}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => handleRemoveCoachNtxr(coach.coachno)}
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
                </TabsContent>
            </Tabs>
        </div>
    );
}
