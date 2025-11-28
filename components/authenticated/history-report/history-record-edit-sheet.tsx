"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { History } from "@/app/(authenticated)/history-report/types"
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
import { useUpdateHistory } from "./use-history-report"
import { useEffect } from "react"
import { DatePicker } from "@/components/ui/date-picker"

// Define key fields
const KEY_FIELDS = [
    "FCOACHNO", "OCOACHNO", "COACHNO", "CODE", "MFGDT", "MAKE", "BASEDEPOT",
    "REMASTER", "FUND", "COST", "RAKESING", "TWEIGHT", "SPEED", "AGE",
    "ABOEM", "COUPLING", "CORRMHRS", "PERIOD", "LSHOPOUTDT", "LPOHBY",
    "RETPOHDT", "DT_IOH", "RET_DT_IOH", "DUESCH", "POHBY", "SHOPINDT",
    "SHOP", "REMARK"
];

// Helper to check if a field is a date field
const isDateField = (key: string) => {
    return [
        "MFGDT", "LSHOPOUTDT", "RETPOHDT", "DT_IOH", "RET_DT_IOH", "YARDINDT",
        "SHOPINDT", "LIFTDT", "LOWERDT", "RELIFTDT", "AIRBKDT", "PTINDT",
        "HPPTOUTDT", "HPPTINDT", "PTOUTDT", "RMPUDT", "H_CORR_DT", "INISSUE",
        "DATE_COND", "DCWIFIT", "ELECRACFIT", "NTXRFIT", "ISSUEDT", "C_R",
        "ROAMSDT", "ACME", "INSP_DT", "ROAMSOUTDT"
    ].includes(key);
}

const formSchema = z.record(z.string(), z.any())

interface HistoryRecordEditSheetProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    history: History | null
}

export function HistoryRecordEditSheet({
    open,
    onOpenChange,
    history,
}: HistoryRecordEditSheetProps) {
    const updateHistory = useUpdateHistory()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {},
    })

    useEffect(() => {
        if (history) {
            const formattedHistory: any = { ...history };

            // Ensure date fields are Date objects for DatePicker
            Object.keys(formattedHistory).forEach(key => {
                if (isDateField(key) && typeof formattedHistory[key] === 'string') {
                    formattedHistory[key] = new Date(formattedHistory[key]);
                }
            });

            form.reset(formattedHistory);
        }
    }, [history, form]);

    function onSubmit(values: z.infer<typeof formSchema>) {
        if (!history) return;

        const cleanedValues = { ...values };

        updateHistory.mutate({
            id: history.id,
            data: cleanedValues
        }, {
            onSuccess: () => {
                onOpenChange(false);
            }
        });
    }

    if (!history) return null;

    const allKeys = Object.keys(history).filter(key => key !== 'id');
    const keyFields = KEY_FIELDS.filter(field => allKeys.includes(field));
    const otherFields = allKeys.filter(key => !KEY_FIELDS.includes(key));

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-[50vw] sm:w-[50vw] pt-8 px-0">
                <ScrollArea className="h-full px-6">
                    <SheetHeader className="mb-6">
                        <SheetTitle className="text-2xl font-bold">Edit History Record {history.COACHNO}</SheetTitle>
                        <SheetDescription>
                            Make changes to the history record details below.
                        </SheetDescription>
                    </SheetHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pb-8">

                            {/* Key Fields Section */}
                            <div className="space-y-4 rounded-lg border p-4 bg-muted/50">
                                <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-primary" />
                                    Key Fields
                                </h3>
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    {keyFields.map((field) => (
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
                                <Button type="submit" disabled={updateHistory.isPending} size="lg" className="w-full sm:w-auto">
                                    {updateHistory.isPending ? "Saving..." : "Save Changes"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    )
}
