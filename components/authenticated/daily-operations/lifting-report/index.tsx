'use client';

import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { getCoachMasterData } from '@/app/(authenticated)/master-record/actions';
import { updateLiftingReport } from '@/app/(authenticated)/(daily-operations)/lifting-report/actions';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { SearchableSelect } from '@/components/ui/searchable-select';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

export default function LiftingReport() {
    const [selectedCoach, setSelectedCoach] = useState<any | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [inspDate, setInspDate] = useState<Date | undefined>(undefined);
    const [corrStatus, setCorrStatus] = useState<string>('P'); // Default to 'P' (INSPECTION PENDING)
    const [remark, setRemark] = useState<string>('');

    const queryClient = useQueryClient();

    const CORROSION_STATUS_MAP: Record<string, string> = {
        'H': 'HEAVY',
        'M': 'MEDIUM',
        'L': 'LIGHT',
        'C': 'CONTRACTUAL',
        'P': 'INSPECTION PENDING'
    };

    // Fetch coaches with infinite scroll
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading: isLoadingCoaches
    } = useInfiniteQuery({
        queryKey: ['coaches-for-lifting-report', searchTerm],
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
            setSelectedCoach(coach);
            // Pre-fill fields if data exists
            if (coach.insp_dt) setInspDate(new Date(coach.insp_dt));
            else setInspDate(undefined);

            // Handle corrosion status mapping or default
            if (coach.corrstatus) {
                // Check if it matches one of our keys, otherwise default or keep as is (if legacy)
                // For now, assuming data will be consistent or we overwrite it.
                // If the DB has full names (e.g. "HEVY"), we might want to map them back to keys if possible,
                // but simpler to just set it and let the user change it if needed.
                // If existing data is "HEVY", it won't match 'H', 'M', etc.
                // Let's try to be smart: if it's not a single char key, try to map it?
                // Or just use it if it matches a key, else default to 'P'.
                // Actually, if I set it to 'P' when it's "HEVY", I lose data visibility.
                // But the Select component won't show "HEVY" if it's not an option.
                // So I'll just set it to coach.corrstatus and if it's invalid for the Select, it might show empty or value.
                // But the user wants to enforce this new format.
                setCorrStatus(coach.corrstatus);
            } else {
                setCorrStatus('P');
            }

            if (coach.remark) setRemark(coach.remark);
            else setRemark('');
        }
    };

    // Mutation for saving data
    const mutation = useMutation({
        mutationFn: async (data: { coachno: string, insp_dt?: Date, corrstatus?: string, remark?: string }) => {
            const response = await updateLiftingReport({
                coachno: data.coachno,
                insp_dt: data.insp_dt,
                corrstatus: data.corrstatus,
                remark: data.remark
            });
            if (!response.success) throw new Error(response.error);
            return response;
        },
        onSuccess: (data: any) => {
            toast.success(data.message || 'Corrosion Status updated successfully');
            setSelectedCoach(null);
            setInspDate(undefined);
            setCorrStatus('P'); // Reset to default
            setRemark('');
            queryClient.invalidateQueries({ queryKey: ['coaches-for-lifting-report'] });
        },
        onError: (error) => {
            toast.error(`Failed to save: ${error.message}`);
        },
    });

    const handleSave = () => {
        if (!selectedCoach) {
            toast.error('Please select a coach');
            return;
        }

        // Adjust date to noon to avoid timezone issues when converting to UTC
        let adjustedDate: Date | undefined = undefined;
        if (inspDate) {
            adjustedDate = new Date(inspDate);
            adjustedDate.setHours(12);
        }

        mutation.mutate({
            coachno: selectedCoach.coachno,
            insp_dt: adjustedDate,
            corrstatus: corrStatus || undefined,
            remark: remark || undefined
        });
    };

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Corrosion Status</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column: Coach Selection and Form */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Corrosion Status Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Select Coach</Label>
                                <SearchableSelect
                                    value={selectedCoach?.coachno || ""}
                                    onValueChange={handleSelectCoach}
                                    options={coachOptions}
                                    onSearch={setSearchTerm}
                                    onLoadMore={fetchNextPage}
                                    hasMore={hasNextPage}
                                    isLoading={isLoadingCoaches || isFetchingNextPage}
                                    placeholder="Select coach..."
                                    searchPlaceholder="Search coach number..."
                                    keepOpenOnSelect={false}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Inspection Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full pl-3 text-left font-normal",
                                                !inspDate && "text-muted-foreground"
                                            )}
                                        >
                                            {inspDate ? (
                                                format(inspDate, "PPP")
                                            ) : (
                                                <span>Pick a date</span>
                                            )}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={inspDate}
                                            onSelect={setInspDate}
                                            disabled={(date) =>
                                                date > new Date() || date < new Date("1900-01-01")
                                            }
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="space-y-2">
                                <Label>Corrosion Status</Label>
                                <Select value={corrStatus} onValueChange={setCorrStatus}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="P">INSPECTION PENDING</SelectItem>
                                        <SelectItem value="L">LIGHT</SelectItem>
                                        <SelectItem value="M">MEDIUM</SelectItem>
                                        <SelectItem value="H">HEAVY</SelectItem>
                                        <SelectItem value="C">CONTRACTUAL</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Remark</Label>
                                <Textarea
                                    placeholder="Enter remarks..."
                                    value={remark}
                                    onChange={(e) => setRemark(e.target.value)}
                                />
                            </div>

                            <Button
                                className="w-full"
                                onClick={handleSave}
                                disabled={!selectedCoach || mutation.isPending}
                            >
                                {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Updates
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Selected Coach Details */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Coach Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {selectedCoach ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-muted-foreground">Coach Number</Label>
                                            <div className="font-medium">{selectedCoach.coachno}</div>
                                        </div>
                                        <div>
                                            <Label className="text-muted-foreground">Shop</Label>
                                            <div className="font-medium">{selectedCoach.shop || '-'}</div>
                                        </div>
                                        <div>
                                            <Label className="text-muted-foreground">Code</Label>
                                            <div className="font-medium">{selectedCoach.code || '-'}</div>
                                        </div>
                                        <div>
                                            <Label className="text-muted-foreground">POH By</Label>
                                            <div className="font-medium">{selectedCoach.pohby || '-'}</div>
                                        </div>
                                        <div>
                                            <Label className="text-muted-foreground">Current Insp Date</Label>
                                            <div className="font-medium">
                                                {selectedCoach.insp_dt ? format(new Date(selectedCoach.insp_dt), 'PPP') : '-'}
                                            </div>
                                        </div>
                                        <div>
                                            <Label className="text-muted-foreground">Current Corrosion Status</Label>
                                            <div className="font-medium">
                                                {selectedCoach.corrstatus ? (CORROSION_STATUS_MAP[selectedCoach.corrstatus] || selectedCoach.corrstatus) : '-'}
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground">Current Remark</Label>
                                        <div className="font-medium mt-1 p-2 bg-muted rounded-md text-sm">
                                            {selectedCoach.remark || 'No remarks'}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-48 flex items-center justify-center text-muted-foreground">
                                    Select a coach to view details
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
