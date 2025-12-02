'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { getCoachMasterData } from '@/app/(authenticated)/master-record/actions';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';

// Schema for the form
const formSchema = z.object({
    coachno: z.string().min(1, 'Coach number is required'),
    yardindt: z.date(),
    pohby: z.string().min(1, 'POH By is required'),
    status: z.string().min(1, 'Status is required'),
    remark: z.string().optional(),
    remaster: z.string().optional(),
    duesch: z.string().optional(),
    lschedule: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const STATUS_OPTIONS = [
    { value: 'POH', label: 'Periodic Overhaul - POH' },
    { value: 'MISC', label: 'Miscellaneous - MISC' },
    { value: 'SR', label: 'Special Repair - SR' },
    { value: 'COND', label: 'Condemnation - COND' },
    { value: 'TRANSIN', label: 'Transfer In - TRANSIN' },
];

const POH_OPTIONS = [
    { value: 'YD', label: 'Yard - YD' },
    { value: 'PL', label: 'Lower Parel - PL' },
];

const SCHEDULE_OPTIONS = [
    { value: 'SS1_18M', label: 'SS1 (18 Months)' },
    { value: 'SS2', label: 'SS2' },
    { value: 'SS1_54M', label: 'SS1 (54 Months)' },
    { value: 'SS3', label: 'SS3' },
];

export default function AddCoachInYard() {
    const [selectedCoach, setSelectedCoach] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const queryClient = useQueryClient();

    // Form initialization
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            coachno: '',
            yardindt: new Date(),
            pohby: 'YD',
            status: 'POH',
            remark: '',
            remaster: '',
            duesch: '',
            lschedule: '',
        },
    });

    // Fetch coaches with infinite scroll
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading: isLoadingCoaches
    } = useInfiniteQuery({
        queryKey: ['coaches-in-yard-candidates', searchTerm],
        queryFn: async ({ pageParam = 1 }) => {
            const filters: any[] = [{ column: 'pohby', operator: 'isEmpty' }];

            const response = await getCoachMasterData({
                filters: JSON.stringify(filters),
                page: pageParam,
                pageSize: 20,
                coachno: searchTerm || undefined, // Search by coachno
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

    // Mutation for saving data
    const mutation = useMutation({
        mutationFn: async (values: FormValues) => {
            const response = await fetch('/api/v1/coach/yard', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            });
            const result = await response.json();
            if (!result.success) throw new Error(result.error);
            return result;
        },
        onSuccess: () => {
            toast.success('Coach added to yard successfully');
            form.reset({
                coachno: '',
                yardindt: new Date(),
                pohby: 'YD',
                status: 'POH',
                remark: '',
                remaster: '',
                duesch: '',
                lschedule: '',
            });
            setSelectedCoach(null);
            queryClient.invalidateQueries({ queryKey: ['coaches-in-yard-candidates'] });
        },
        onError: (error) => {
            toast.error(`Failed to save: ${error.message}`);
        },
    });

    const onSubmit = (values: FormValues) => {
        mutation.mutate(values);
    };

    const handleSelectCoach = (coachno: string) => {
        const selectedOption = coachOptions.find(opt => opt.value === coachno);
        if (selectedOption) {
            const coach = selectedOption.original;
            setSelectedCoach(coach);
            form.setValue('coachno', coachno);
            form.setValue('remark', coach.remark || '');
            form.setValue('remaster', coach.remaster || '');

            // LHB Schedule Logic
            if (coach.lhbnlhb === 'Y') {
                let nextDuesch = '';
                let nextLschedule = '';

                const currentDuesch = coach.duesch;

                if (!currentDuesch) {
                    nextDuesch = 'SS1_18M';
                    nextLschedule = '';
                } else if (currentDuesch === 'SS1_18M') {
                    nextDuesch = 'SS2';
                    nextLschedule = 'SS1_18M';
                } else if (currentDuesch === 'SS2') {
                    nextDuesch = 'SS1_54M';
                    nextLschedule = 'SS2';
                } else if (currentDuesch === 'SS1_54M') {
                    nextDuesch = 'SS3';
                    nextLschedule = 'SS1_54M';
                } else if (currentDuesch === 'SS3') {
                    nextDuesch = 'SS1_18M';
                    nextLschedule = 'SS3';
                } else {
                    nextDuesch = 'SS1_18M';
                }

                form.setValue('duesch', nextDuesch);
                form.setValue('lschedule', nextLschedule);
            } else {
                form.setValue('duesch', '');
                form.setValue('lschedule', '');
            }
        }
    };

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Add Coach in Yard</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column: Coach Selection and Details */}
                <div className="md:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Select Coach</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <SearchableSelect
                                value={form.watch('coachno')}
                                onValueChange={handleSelectCoach}
                                options={coachOptions}
                                onSearch={setSearchTerm}
                                onLoadMore={fetchNextPage}
                                hasMore={hasNextPage}
                                isLoading={isLoadingCoaches || isFetchingNextPage}
                                placeholder="Select coach..."
                                searchPlaceholder="Search coach number..."
                            />
                        </CardContent>
                    </Card>

                    {selectedCoach && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Coach Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <DetailRow label="Coach No" value={selectedCoach.coachno} />
                                <DetailRow label="Coach Code" value={selectedCoach.code} />
                                <DetailRow
                                    label="Last POH Date"
                                    value={selectedCoach.lshopoutdt ? format(new Date(selectedCoach.lshopoutdt), 'dd/MM/yyyy') : '-'}
                                />
                                <DetailRow
                                    label="Return Date"
                                    value={selectedCoach.retpohdt ? format(new Date(selectedCoach.retpohdt), 'dd/MM/yyyy') : '-'}
                                />
                                <DetailRow label="LHB Last Schedule" value={selectedCoach.lschedule} />
                                <DetailRow label="LHB Due Schedule" value={selectedCoach.duesch} />
                                <DetailRow label="Age on Today" value={selectedCoach.age?.toString()} />
                                <DetailRow label="Last POH By" value={selectedCoach.lpohby} />
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Right Column: Form */}
                <div className="md:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Yard Entry Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="yardindt"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Date in Yard</FormLabel>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <FormControl>
                                                                <Button
                                                                    variant={"outline"}
                                                                    className={cn(
                                                                        "w-full pl-3 text-left font-normal",
                                                                        !field.value && "text-muted-foreground"
                                                                    )}
                                                                >
                                                                    {field.value ? (
                                                                        format(field.value, "PPP")
                                                                    ) : (
                                                                        <span>Pick a date</span>
                                                                    )}
                                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                                </Button>
                                                            </FormControl>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-0" align="start">
                                                            <Calendar
                                                                mode="single"
                                                                selected={field.value}
                                                                onSelect={field.onChange}
                                                                disabled={(date) =>
                                                                    date > new Date() || date < new Date("1900-01-01")
                                                                }
                                                                initialFocus
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="pohby"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>POH In</FormLabel>
                                                    <FormControl>
                                                        <SearchableSelect
                                                            value={field.value}
                                                            onValueChange={field.onChange}
                                                            options={POH_OPTIONS}
                                                            placeholder="Select POH In"
                                                            searchPlaceholder="Search..."
                                                            disabled={true}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="status"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Status</FormLabel>
                                                    <FormControl>
                                                        <SearchableSelect
                                                            value={field.value}
                                                            onValueChange={field.onChange}
                                                            options={STATUS_OPTIONS}
                                                            placeholder="Select Status"
                                                            searchPlaceholder="Search Status..."
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {selectedCoach?.lhbnlhb === 'Y' && (
                                            <>
                                                <FormField
                                                    control={form.control}
                                                    name="duesch"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Due Schedule (LHB)</FormLabel>
                                                            <FormControl>
                                                                <SearchableSelect
                                                                    value={field.value}
                                                                    onValueChange={(val) => {
                                                                        field.onChange(val);
                                                                        // Manual override logic
                                                                        let calculatedLschedule = '';
                                                                        if (val === 'SS2') calculatedLschedule = 'SS1_18M';
                                                                        else if (val === 'SS1_54M') calculatedLschedule = 'SS2';
                                                                        else if (val === 'SS3') calculatedLschedule = 'SS1_54M';
                                                                        else if (val === 'SS1_18M') calculatedLschedule = 'SS3';

                                                                        form.setValue('lschedule', calculatedLschedule);
                                                                    }}
                                                                    options={SCHEDULE_OPTIONS}
                                                                    placeholder="Select Schedule"
                                                                    searchPlaceholder="Search Schedule..."
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="lschedule"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Last Schedule (LHB)</FormLabel>
                                                            <FormControl>
                                                                <Input {...field} readOnly className="bg-muted" />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </>
                                        )}
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="remark"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Shop Remark</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Enter shop remarks..."
                                                        className="resize-none"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="remaster"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Master Remark</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Enter master remarks..."
                                                        className="resize-none"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="flex justify-end">
                                        <Button
                                            type="submit"
                                            disabled={!selectedCoach || mutation.isPending}
                                        >
                                            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Save Details
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function DetailRow({ label, value }: { label: string; value: string | undefined | null }) {
    return (
        <div className="flex justify-between py-2 border-b last:border-0">
            <span className="text-sm font-medium text-muted-foreground">{label}</span>
            <span className="text-sm font-semibold">{value || '-'}</span>
        </div>
    );
}