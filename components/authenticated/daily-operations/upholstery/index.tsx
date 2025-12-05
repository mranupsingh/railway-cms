'use client';

import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { CalendarIcon, Loader2, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { getCoachMasterData } from '@/app/(authenticated)/master-record/actions';
import { updateUpholsteryDates } from '@/app/(authenticated)/(daily-operations)/upholstery/actions';
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

export default function Upholstery() {
    const [selectedCoachesUnload, setSelectedCoachesUnload] = useState<any[]>([]);
    const [selectedCoachesLoad, setSelectedCoachesLoad] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [unloadDate, setUnloadDate] = useState<Date | undefined>(undefined);
    const [loadDate, setLoadDate] = useState<Date | undefined>(undefined);
    const queryClient = useQueryClient();

    // Fetch coaches with infinite scroll
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading: isLoadingCoaches
    } = useInfiniteQuery({
        queryKey: ['coaches-for-upholstery', searchTerm],
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

    const handleSelectCoachUnload = (coachno: string) => {
        const selectedOption = coachOptions.find(opt => opt.value === coachno);
        if (selectedOption) {
            const coach = selectedOption.original;
            if (selectedCoachesUnload.find(c => c.coachno === coach.coachno)) {
                setSelectedCoachesUnload(selectedCoachesUnload.filter(c => c.coachno !== coachno));
            } else {
                setSelectedCoachesUnload([...selectedCoachesUnload, coach]);
            }
        }
    };

    const handleSelectCoachLoad = (coachno: string) => {
        const selectedOption = coachOptions.find(opt => opt.value === coachno);
        if (selectedOption) {
            const coach = selectedOption.original;
            if (selectedCoachesLoad.find(c => c.coachno === coach.coachno)) {
                setSelectedCoachesLoad(selectedCoachesLoad.filter(c => c.coachno !== coachno));
            } else {
                setSelectedCoachesLoad([...selectedCoachesLoad, coach]);
            }
        }
    };

    const handleRemoveCoachUnload = (coachno: string) => {
        setSelectedCoachesUnload(selectedCoachesUnload.filter(c => c.coachno !== coachno));
    };

    const handleRemoveCoachLoad = (coachno: string) => {
        setSelectedCoachesLoad(selectedCoachesLoad.filter(c => c.coachno !== coachno));
    };

    // Mutation for saving data
    const mutation = useMutation({
        mutationFn: async (data: { coaches: string[], uphundt?: Date, uphlddt?: Date }) => {
            const response = await updateUpholsteryDates({
                coachNos: data.coaches,
                uphundt: data.uphundt,
                uphlddt: data.uphlddt
            });
            if (!response.success) throw new Error(response.error);
            return response;
        },
        onSuccess: (data: any) => {
            toast.success(data.message || 'Upholstery dates updated successfully');
            setSelectedCoachesUnload([]);
            setSelectedCoachesLoad([]);
            setUnloadDate(undefined);
            setLoadDate(undefined);
            queryClient.invalidateQueries({ queryKey: ['coaches-for-upholstery'] });
        },
        onError: (error) => {
            toast.error(`Failed to save: ${error.message}`);
        },
    });

    const handleSaveUnload = () => {
        if (selectedCoachesUnload.length === 0) {
            toast.error('Please select at least one coach');
            return;
        }
        if (!unloadDate) {
            toast.error('Please select an unload date');
            return;
        }
        // Adjust date to noon to avoid timezone issues when converting to UTC
        const adjustedDate = new Date(unloadDate);
        adjustedDate.setHours(12);
        mutation.mutate({ coaches: selectedCoachesUnload.map(c => c.coachno), uphundt: adjustedDate });
    };

    const handleSaveLoad = () => {
        if (selectedCoachesLoad.length === 0) {
            toast.error('Please select at least one coach');
            return;
        }
        if (!loadDate) {
            toast.error('Please select a load date');
            return;
        }
        // Adjust date to noon to avoid timezone issues when converting to UTC
        const adjustedDate = new Date(loadDate);
        adjustedDate.setHours(12);
        mutation.mutate({ coaches: selectedCoachesLoad.map(c => c.coachno), uphlddt: adjustedDate });
    };

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Upholstery Update</h1>
            </div>

            <Tabs defaultValue="unload" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="unload">Upholstery Unload</TabsTrigger>
                    <TabsTrigger value="load">Upholstery Load</TabsTrigger>
                </TabsList>

                <TabsContent value="unload">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                        {/* Left Column: Controls */}
                        <div className="md:col-span-1 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Unload - Select Coaches</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Add Coach</label>
                                        <SearchableSelect
                                            value=""
                                            onValueChange={handleSelectCoachUnload}
                                            options={coachOptions}
                                            onSearch={setSearchTerm}
                                            onLoadMore={fetchNextPage}
                                            hasMore={hasNextPage}
                                            isLoading={isLoadingCoaches || isFetchingNextPage}
                                            placeholder="Select coach..."
                                            searchPlaceholder="Search coach number..."
                                            keepOpenOnSelect={true}
                                            selectedValues={selectedCoachesUnload.map(c => c.coachno)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Unload Date (uphundt)</label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full pl-3 text-left font-normal",
                                                        !unloadDate && "text-muted-foreground"
                                                    )}
                                                >
                                                    {unloadDate ? (
                                                        format(unloadDate, "PPP")
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={unloadDate}
                                                    onSelect={setUnloadDate}
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
                                        onClick={handleSaveUnload}
                                        disabled={selectedCoachesUnload.length === 0 || !unloadDate || mutation.isPending}
                                    >
                                        {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Save Unload Updates
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column: Selected Coaches Table */}
                        <div className="md:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Selected Coaches ({selectedCoachesUnload.length})</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Coach No</TableHead>
                                                    <TableHead>Code</TableHead>
                                                    <TableHead>Current Unload Date</TableHead>
                                                    <TableHead>New Unload Date</TableHead>
                                                    <TableHead className="w-[50px]"></TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {selectedCoachesUnload.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={5} className="h-24 text-center">
                                                            No coaches selected.
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    selectedCoachesUnload.map((coach) => (
                                                        <TableRow key={coach.coachno}>
                                                            <TableCell className="font-medium">{coach.coachno}</TableCell>
                                                            <TableCell>{coach.code}</TableCell>
                                                            <TableCell>
                                                                {coach.uphundt ? format(new Date(coach.uphundt), 'dd/MM/yyyy') : '-'}
                                                            </TableCell>
                                                            <TableCell className="text-green-600 font-medium">
                                                                {unloadDate ? format(unloadDate, 'dd/MM/yyyy') : '-'}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => handleRemoveCoachUnload(coach.coachno)}
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

                <TabsContent value="load">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                        {/* Left Column: Controls */}
                        <div className="md:col-span-1 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Load - Select Coaches</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Add Coach</label>
                                        <SearchableSelect
                                            value=""
                                            onValueChange={handleSelectCoachLoad}
                                            options={coachOptions}
                                            onSearch={setSearchTerm}
                                            onLoadMore={fetchNextPage}
                                            hasMore={hasNextPage}
                                            isLoading={isLoadingCoaches || isFetchingNextPage}
                                            placeholder="Select coach..."
                                            searchPlaceholder="Search coach number..."
                                            keepOpenOnSelect={true}
                                            selectedValues={selectedCoachesLoad.map(c => c.coachno)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Load Date (uphlddt)</label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full pl-3 text-left font-normal",
                                                        !loadDate && "text-muted-foreground"
                                                    )}
                                                >
                                                    {loadDate ? (
                                                        format(loadDate, "PPP")
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={loadDate}
                                                    onSelect={setLoadDate}
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
                                        onClick={handleSaveLoad}
                                        disabled={selectedCoachesLoad.length === 0 || !loadDate || mutation.isPending}
                                    >
                                        {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Save Load Updates
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column: Selected Coaches Table */}
                        <div className="md:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Selected Coaches ({selectedCoachesLoad.length})</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Coach No</TableHead>
                                                    <TableHead>Code</TableHead>
                                                    <TableHead>Current Load Date</TableHead>
                                                    <TableHead>New Load Date</TableHead>
                                                    <TableHead className="w-[50px]"></TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {selectedCoachesLoad.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={5} className="h-24 text-center">
                                                            No coaches selected.
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    selectedCoachesLoad.map((coach) => (
                                                        <TableRow key={coach.coachno}>
                                                            <TableCell className="font-medium">{coach.coachno}</TableCell>
                                                            <TableCell>{coach.code}</TableCell>
                                                            <TableCell>
                                                                {coach.uphlddt ? format(new Date(coach.uphlddt), 'dd/MM/yyyy') : '-'}
                                                            </TableCell>
                                                            <TableCell className="text-green-600 font-medium">
                                                                {loadDate ? format(loadDate, 'dd/MM/yyyy') : '-'}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => handleRemoveCoachLoad(coach.coachno)}
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
