"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { CoachMaster } from "@/app/(authenticated)/master-record/types"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { useUpdateCoachMaster } from "./use-master-report"
import { useEffect } from "react"
import { DatePicker } from "@/components/ui/date-picker"

// Define master fields as requested
const MASTER_FIELDS = [
    "fcoachno", "ocoachno", "coachno", "code", "mfgdt", "make", "basedepot",
    "re_placed", "dt_placed", "comdt", "remaster", "fund", "cost", "rakesing",
    "tweight", "speed", "age", "overagedt", "aboem", "coupling", "corrmhrs",
    "period", "lshopoutdt", "lpohby", "retpohdt", "dt_ioh", "ret_dt_ioh",
    "mlrdt", "mlrby", "date_rf", "date_conv", "lschedule", "duesch", "pohby",
    "shopindt", "shop", "remark", "ioh_by"
];

// Helper to check if a field is a date field
const isDateField = (key: string) => {
    return [
        "mfgdt", "dt_placed", "comdt", "overagedt", "lshopoutdt", "retpohdt",
        "dt_ioh", "ret_dt_ioh", "mlrdt", "date_rf", "date_conv", "yardindt",
        "shopindt", "liftdt", "lowerdt", "reliftdt", "airbkdt", "ptindt",
        "ptoutdt", "h_corr_dt", "inissue", "dcwifit", "elecracfit", "ntxrfit",
        "innhs1dt", "innhs2dt", "insp_dt", "l_3yr_done", "l_6yr_done",
        "l_9yr_done", "l_3yr_due", "l_6yr_due", "l_9yr_due", "uphlddt",
        "acme", "uphundt", "btlddt", "btundt", "roamsdt"
    ].includes(key);
}

// Create a schema that allows any string/number/date for simplicity, 
// but in a real app you'd want stricter validation based on types
const formSchema = z.record(z.string(), z.any())

interface MasterRecordEditSheetProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    coach: CoachMaster | null
}

export function MasterRecordEditSheet({
    open,
    onOpenChange,
    coach,
}: MasterRecordEditSheetProps) {
    const updateCoach = useUpdateCoachMaster()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {},
    })

    useEffect(() => {
        if (coach) {
            // Reset form with coach data when it changes
            // Convert dates to string for input fields if needed, or keep as is
            const formattedCoach: any = { ...coach };

            // Ensure date fields are Date objects for DatePicker
            Object.keys(formattedCoach).forEach(key => {
                if (isDateField(key) && typeof formattedCoach[key] === 'string') {
                    formattedCoach[key] = new Date(formattedCoach[key]);
                }
            });

            form.reset(formattedCoach);
        }
    }, [coach, form]);

    function onSubmit(values: z.infer<typeof formSchema>) {
        if (!coach) return;

        // Filter out empty strings if needed or handle type conversions
        // For now, sending as is, backend/prisma should handle type coercion if set up correctly
        // or we might need to parse numbers/dates back.

        // Let's do some basic cleanup
        const cleanedValues = { ...values };

        // Fix date timezone issues by converting to UTC date string
        Object.keys(cleanedValues).forEach(key => {
            if (isDateField(key) && cleanedValues[key] instanceof Date) {
                const date = cleanedValues[key];
                // Create a UTC date that matches the local date
                // This ensures 31st Dec local becomes 31st Dec UTC
                const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
                cleanedValues[key] = utcDate;
            }
        });

        // Remove nulls/undefined if you want partial updates only for changed fields
        // But here we are sending everything.

        updateCoach.mutate({
            coachno: coach.coachno,
            data: cleanedValues
        }, {
            onSuccess: () => {
                onOpenChange(false);
            }
        });
    }

    if (!coach) return null;

    // Separate fields
    const allKeys = Object.keys(coach).filter(key => key !== 'coachno'); // Exclude PK from edit if it's not editable

    const masterFields = MASTER_FIELDS.filter(field => field !== 'coachno');
    const otherFields = allKeys.filter(key => !MASTER_FIELDS.includes(key));

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-[50vw] sm:w-[50vw] pt-8 px-0">
                <ScrollArea className="h-full px-6">
                    <SheetHeader className="mb-6">
                        <SheetTitle className="text-2xl font-bold">Edit Coach {coach.coachno}</SheetTitle>
                        <SheetDescription>
                            Make changes to the coach details below.
                        </SheetDescription>
                    </SheetHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pb-8">

                            {/* Master Fields Section */}
                            <div className="space-y-4 rounded-lg border p-4 bg-muted/50">
                                <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-primary" />
                                    Master Fields
                                </h3>
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    {masterFields.map((field) => (
                                        <FormField
                                            key={field}
                                            control={form.control}
                                            name={field}
                                            render={({ field: formField }) => (
                                                <FormItem>
                                                    <FormLabel className="capitalize font-medium text-muted-foreground">{field.replace(/_/g, ' ')}</FormLabel>
                                                    <FormControl>
                                                        {isDateField(field) ? (
                                                            <DatePicker
                                                                value={formField.value}
                                                                onChange={formField.onChange}
                                                            />
                                                        ) : (
                                                            <Input {...formField} value={formField.value || ''} className="bg-background" />
                                                        )}
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Other Fields Section */}
                            <div className="space-y-4 rounded-lg border p-4">
                                <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-muted-foreground" />
                                    Other Fields
                                </h3>
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    {otherFields.map((field) => (
                                        <FormField
                                            key={field}
                                            control={form.control}
                                            name={field}
                                            render={({ field: formField }) => (
                                                <FormItem>
                                                    <FormLabel className="capitalize font-medium text-muted-foreground">{field.replace(/_/g, ' ')}</FormLabel>
                                                    <FormControl>
                                                        {isDateField(field) ? (
                                                            <DatePicker
                                                                value={formField.value}
                                                                onChange={formField.onChange}
                                                            />
                                                        ) : (
                                                            <Input {...formField} value={formField.value || ''} />
                                                        )}
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="sticky bottom-0 flex justify-end pt-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4 border-t mt-auto">
                                <Button type="submit" disabled={updateCoach.isPending} size="lg" className="w-full sm:w-auto">
                                    {updateCoach.isPending ? "Saving..." : "Save Changes"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    )
}
