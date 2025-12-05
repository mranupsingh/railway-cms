'use client';

import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { getCoachMasterData } from '@/app/(authenticated)/master-record/actions';
import { updateBatteryUpholsteryStatus } from '@/app/(authenticated)/(daily-operations)/battery-upholstery/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SearchableSelect } from '@/components/ui/searchable-select';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function BatteryUpholstery() {
    const [selectedCoachesBattery, setSelectedCoachesBattery] = useState<any[]>([]);
    const [selectedCoachesUpholstery, setSelectedCoachesUpholstery] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [batteryStatus, setBatteryStatus] = useState<string>('');
    const [upholsteryStatus, setUpholsteryStatus] = useState<string>('');
    const queryClient = useQueryClient();

    // Fetch coaches with infinite scroll
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading: isLoadingCoaches
    } = useInfiniteQuery({
        queryKey: ['coaches-for-battery-upholstery', searchTerm],
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

    const handleSelectCoachBattery = (coachno: string) => {
        const selectedOption = coachOptions.find(opt => opt.value === coachno);
        if (selectedOption) {
            const coach = selectedOption.original;
            if (selectedCoachesBattery.find(c => c.coachno === coach.coachno)) {
                setSelectedCoachesBattery(selectedCoachesBattery.filter(c => c.coachno !== coachno));
            } else {
                setSelectedCoachesBattery([...selectedCoachesBattery, coach]);
            }
        }
    };

    const handleSelectCoachUpholstery = (coachno: string) => {
        const selectedOption = coachOptions.find(opt => opt.value === coachno);
        if (selectedOption) {
            const coach = selectedOption.original;
            if (selectedCoachesUpholstery.find(c => c.coachno === coach.coachno)) {
                setSelectedCoachesUpholstery(selectedCoachesUpholstery.filter(c => c.coachno !== coachno));
            } else {
                setSelectedCoachesUpholstery([...selectedCoachesUpholstery, coach]);
            }
        }
    };

    const handleRemoveCoachBattery = (coachno: string) => {
        setSelectedCoachesBattery(selectedCoachesBattery.filter(c => c.coachno !== coachno));
    };

    const handleRemoveCoachUpholstery = (coachno: string) => {
        setSelectedCoachesUpholstery(selectedCoachesUpholstery.filter(c => c.coachno !== coachno));
    };

    // Mutation for saving data
    const mutation = useMutation({
        mutationFn: async (data: { coaches: string[], batteryld?: string, upholstry?: string }) => {
            const response = await updateBatteryUpholsteryStatus({
                coachNos: data.coaches,
                batteryld: data.batteryld,
                upholstry: data.upholstry
            });
            if (!response.success) throw new Error(response.error);
            return response;
        },
        onSuccess: (data: any) => {
            toast.success(data.message || 'Status updated successfully');
            setSelectedCoachesBattery([]);
            setSelectedCoachesUpholstery([]);
            setBatteryStatus('');
            setUpholsteryStatus('');
            queryClient.invalidateQueries({ queryKey: ['coaches-for-battery-upholstery'] });
        },
        onError: (error) => {
            toast.error(`Failed to save: ${error.message}`);
        },
    });

    const handleSaveBattery = () => {
        if (selectedCoachesBattery.length === 0) {
            toast.error('Please select at least one coach');
            return;
        }
        if (!batteryStatus) {
            toast.error('Please select a battery status');
            return;
        }
        mutation.mutate({ coaches: selectedCoachesBattery.map(c => c.coachno), batteryld: batteryStatus });
    };

    const handleSaveUpholstery = () => {
        if (selectedCoachesUpholstery.length === 0) {
            toast.error('Please select at least one coach');
            return;
        }
        if (!upholsteryStatus) {
            toast.error('Please select an upholstery status');
            return;
        }
        mutation.mutate({ coaches: selectedCoachesUpholstery.map(c => c.coachno), upholstry: upholsteryStatus });
    };

    const getBatteryStatusLabel = (code: string) => {
        switch (code) {
            case 'UN': return 'Battery Unload';
            case 'OK': return 'Battery OK';
            case 'LD': return 'Battery Load';
            default: return code;
        }
    };

    const getUpholsteryStatusLabel = (code: string) => {
        switch (code) {
            case 'UN': return 'Upholstery Unload';
            case 'PL': return 'Upholstery Partial Load';
            case 'LD': return 'Upholstery Load';
            default: return code;
        }
    };

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Battery & Upholstery Status</h1>
            </div>

            <Tabs defaultValue="battery" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="battery">Battery Status</TabsTrigger>
                    <TabsTrigger value="upholstery">Upholstery Status</TabsTrigger>
                </TabsList>

                <TabsContent value="battery">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                        {/* Left Column: Controls */}
                        <div className="md:col-span-1 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Battery - Select Coaches</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Add Coach</label>
                                        <SearchableSelect
                                            value=""
                                            onValueChange={handleSelectCoachBattery}
                                            options={coachOptions}
                                            onSearch={setSearchTerm}
                                            onLoadMore={fetchNextPage}
                                            hasMore={hasNextPage}
                                            isLoading={isLoadingCoaches || isFetchingNextPage}
                                            placeholder="Select coach..."
                                            searchPlaceholder="Search coach number..."
                                            keepOpenOnSelect={true}
                                            selectedValues={selectedCoachesBattery.map(c => c.coachno)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Battery Status</label>
                                        <Select value={batteryStatus} onValueChange={setBatteryStatus}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="UN">Battery Unload</SelectItem>
                                                <SelectItem value="OK">Battery OK</SelectItem>
                                                <SelectItem value="LD">Battery Load</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <Button
                                        className="w-full"
                                        onClick={handleSaveBattery}
                                        disabled={selectedCoachesBattery.length === 0 || !batteryStatus || mutation.isPending}
                                    >
                                        {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Save Battery Status
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column: Selected Coaches Table */}
                        <div className="md:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Selected Coaches ({selectedCoachesBattery.length})</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Coach No</TableHead>
                                                    <TableHead>Code</TableHead>
                                                    <TableHead>Current Status</TableHead>
                                                    <TableHead>New Status</TableHead>
                                                    <TableHead className="w-[50px]"></TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {selectedCoachesBattery.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={5} className="h-24 text-center">
                                                            No coaches selected.
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    selectedCoachesBattery.map((coach) => (
                                                        <TableRow key={coach.coachno}>
                                                            <TableCell className="font-medium">{coach.coachno}</TableCell>
                                                            <TableCell>{coach.code}</TableCell>
                                                            <TableCell>
                                                                {getBatteryStatusLabel(coach.batteryld) || '-'}
                                                            </TableCell>
                                                            <TableCell className="text-green-600 font-medium">
                                                                {getBatteryStatusLabel(batteryStatus) || '-'}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => handleRemoveCoachBattery(coach.coachno)}
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

                <TabsContent value="upholstery">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                        {/* Left Column: Controls */}
                        <div className="md:col-span-1 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Upholstery - Select Coaches</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Add Coach</label>
                                        <SearchableSelect
                                            value=""
                                            onValueChange={handleSelectCoachUpholstery}
                                            options={coachOptions}
                                            onSearch={setSearchTerm}
                                            onLoadMore={fetchNextPage}
                                            hasMore={hasNextPage}
                                            isLoading={isLoadingCoaches || isFetchingNextPage}
                                            placeholder="Select coach..."
                                            searchPlaceholder="Search coach number..."
                                            keepOpenOnSelect={true}
                                            selectedValues={selectedCoachesUpholstery.map(c => c.coachno)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Upholstery Status</label>
                                        <Select value={upholsteryStatus} onValueChange={setUpholsteryStatus}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="UN">Upholstery Unload</SelectItem>
                                                <SelectItem value="PL">Upholstery Partial Load</SelectItem>
                                                <SelectItem value="LD">Upholstery Load</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <Button
                                        className="w-full"
                                        onClick={handleSaveUpholstery}
                                        disabled={selectedCoachesUpholstery.length === 0 || !upholsteryStatus || mutation.isPending}
                                    >
                                        {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Save Upholstery Status
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column: Selected Coaches Table */}
                        <div className="md:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Selected Coaches ({selectedCoachesUpholstery.length})</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Coach No</TableHead>
                                                    <TableHead>Code</TableHead>
                                                    <TableHead>Current Status</TableHead>
                                                    <TableHead>New Status</TableHead>
                                                    <TableHead className="w-[50px]"></TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {selectedCoachesUpholstery.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={5} className="h-24 text-center">
                                                            No coaches selected.
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    selectedCoachesUpholstery.map((coach) => (
                                                        <TableRow key={coach.coachno}>
                                                            <TableCell className="font-medium">{coach.coachno}</TableCell>
                                                            <TableCell>{coach.code}</TableCell>
                                                            <TableCell>
                                                                {getUpholsteryStatusLabel(coach.upholstry) || '-'}
                                                            </TableCell>
                                                            <TableCell className="text-green-600 font-medium">
                                                                {getUpholsteryStatusLabel(upholsteryStatus) || '-'}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => handleRemoveCoachUpholstery(coach.coachno)}
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
