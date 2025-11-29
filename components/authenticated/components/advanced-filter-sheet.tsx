"use client"

import { FilterCondition, FilterableColumn, getOperatorsForType, getOperatorLabel } from "@/app/lib/types/filter"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { FilterIcon, PlusIcon, XIcon } from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import { v4 as uuidv4 } from 'uuid'
import { DatePicker } from "@/components/ui/date-picker"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SearchableSelect, SearchableSelectOption } from "./searchable-select"

interface AdvancedFilterSheetProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    columns: FilterableColumn[]
    onApplyFilters: (conditions: FilterCondition[]) => void
    initialConditions?: FilterCondition[]
}

export function AdvancedFilterSheet({
    open,
    onOpenChange,
    columns,
    onApplyFilters,
    initialConditions = [],
}: AdvancedFilterSheetProps) {
    const [conditions, setConditions] = useState<FilterCondition[]>([])

    useEffect(() => {
        if (open) {
            if (initialConditions.length > 0) {
                setConditions(initialConditions)
            } else if (conditions.length === 0) {
                addCondition()
            }
        }
    }, [open, initialConditions])

    const addCondition = () => {
        const firstColumn = columns[0]
        const newCondition: FilterCondition = {
            id: uuidv4(),
            column: firstColumn.id,
            operator: 'contains',
            value: '',
            logicalOperator: 'AND',
            type: firstColumn.type,
        }
        setConditions([...conditions, newCondition])
    }

    const removeCondition = (id: string) => {
        setConditions(conditions.filter((c) => c.id !== id))
    }

    const updateCondition = (id: string, field: keyof FilterCondition, value: any) => {
        setConditions(
            conditions.map((c) => {
                if (c.id === id) {
                    const updated = { ...c, [field]: value }

                    // Reset operator and value if column changes
                    if (field === 'column') {
                        const col = columns.find((col) => col.id === value)
                        if (col) {
                            const ops = getOperatorsForType(col.type)
                            updated.operator = ops[0]
                            updated.value = ''
                            updated.valueTo = undefined
                            updated.type = col.type
                        }
                    }

                    return updated
                }
                return c
            })
        )
    }

    const handleApply = () => {
        // Filter out incomplete conditions
        const validConditions = conditions.filter((c) => {
            if (c.operator === 'isEmpty' || c.operator === 'isNotEmpty') return true
            if (c.operator === 'dateRange') return c.value && c.valueTo
            return c.value !== undefined && c.value !== ''
        })

        onApplyFilters(validConditions)
        onOpenChange(false)
    }

    const handleClear = () => {
        setConditions([])
        onApplyFilters([])
        onOpenChange(false)
    }

    // Convert columns to options format - moved outside of render loop
    const columnOptions: SearchableSelectOption[] = useMemo(() => {
        return columns.map(col => ({
            value: col.id,
            label: col.label
        }))
    }, [columns])

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-[600px] sm:w-[600px] flex flex-col p-0 gap-0">
                <SheetHeader className="px-6 py-4 border-b">
                    <SheetTitle className="flex items-center gap-2">
                        <FilterIcon className="h-5 w-5" />
                        Advanced Filters
                    </SheetTitle>
                    <SheetDescription>Build complex queries to filter your data.</SheetDescription>
                </SheetHeader>

                <ScrollArea className="flex-1 px-6 py-6">
                    <div className="space-y-6">
                        {conditions.length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg">
                                <p>No filters applied</p>
                                <Button variant="link" onClick={addCondition}>
                                    Add a filter
                                </Button>
                            </div>
                        ) : (
                            conditions.map((condition, index) => {
                                const column = columns.find((c) => c.id === condition.column) || columns[0]
                                const operators = getOperatorsForType(column.type)
                                const isDateRange = condition.operator === 'dateRange'
                                const needsValue = !['isEmpty', 'isNotEmpty'].includes(condition.operator)

                                // Convert operators to options format
                                const operatorOptions: SearchableSelectOption[] = operators.map(op => ({
                                    value: op,
                                    label: getOperatorLabel(op)
                                }))

                                return (
                                    <div key={condition.id} className="relative group bg-muted/30 p-4 rounded-lg border">
                                        {index > 0 && (
                                            <div className="absolute -top-3 left-4">
                                                <Select
                                                    value={condition.logicalOperator}
                                                    onValueChange={(value) =>
                                                        updateCondition(condition.id, 'logicalOperator', value)
                                                    }
                                                >
                                                    <SelectTrigger className="h-6 w-20 text-xs bg-background">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="AND">AND</SelectItem>
                                                        <SelectItem value="OR">OR</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}

                                        <div className="grid gap-4">
                                            <div className="grid grid-cols-2 gap-2">
                                                {/* Column Selector with Search */}
                                                <div className="space-y-1">
                                                    <label className="text-xs font-medium text-muted-foreground">
                                                        Column
                                                    </label>
                                                    <SearchableSelect
                                                        options={columnOptions}
                                                        value={condition.column}
                                                        onValueChange={(value) =>
                                                            updateCondition(condition.id, 'column', value)
                                                        }
                                                        placeholder="Select column..."
                                                        searchPlaceholder="Search column..."
                                                        emptyText="No column found."
                                                    />
                                                </div>

                                                {/* Operator Selector with Search */}
                                                <div className="space-y-1">
                                                    <label className="text-xs font-medium text-muted-foreground">
                                                        Operator
                                                    </label>
                                                    <SearchableSelect
                                                        options={operatorOptions}
                                                        value={condition.operator}
                                                        onValueChange={(value) =>
                                                            updateCondition(condition.id, 'operator', value)
                                                        }
                                                        placeholder="Select operator..."
                                                        searchPlaceholder="Search operator..."
                                                        emptyText="No operator found."
                                                    />
                                                </div>
                                            </div>

                                            {needsValue && (
                                                <div className="space-y-1">
                                                    <label className="text-xs font-medium text-muted-foreground">Value</label>
                                                    {column.type === 'date' ? (
                                                        isDateRange ? (
                                                            <div className="flex items-center gap-2">
                                                                <DatePicker
                                                                    value={condition.value ? new Date(condition.value) : undefined}
                                                                    onChange={(date) =>
                                                                        updateCondition(condition.id, 'value', date?.toISOString())
                                                                    }
                                                                />
                                                                <span className="text-muted-foreground">-</span>
                                                                <DatePicker
                                                                    value={
                                                                        condition.valueTo ? new Date(condition.valueTo) : undefined
                                                                    }
                                                                    onChange={(date) =>
                                                                        updateCondition(condition.id, 'valueTo', date?.toISOString())
                                                                    }
                                                                />
                                                            </div>
                                                        ) : (
                                                            <DatePicker
                                                                value={condition.value ? new Date(condition.value) : undefined}
                                                                onChange={(date) =>
                                                                    updateCondition(condition.id, 'value', date?.toISOString())
                                                                }
                                                            />
                                                        )
                                                    ) : (
                                                        <Input
                                                            value={condition.value}
                                                            onChange={(e) =>
                                                                updateCondition(condition.id, 'value', e.target.value)
                                                            }
                                                            placeholder="Enter value..."
                                                            type={column.type === 'number' ? 'number' : 'text'}
                                                        />
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="absolute -top-0.5 -right-0.5 h-6 w-6 rounded-tr-lg bg-destructive hover:bg-destructive/80  text-destructive-foreground hover:text-destructive-foreground/80"
                                            onClick={() => removeCondition(condition.id)}
                                        >
                                            <XIcon className="h-3 w-3" />
                                        </Button>
                                    </div>
                                )
                            })
                        )}

                        <Button variant="outline" size="sm" className="w-full border-dashed" onClick={addCondition}>
                            <PlusIcon className="mr-2 h-4 w-4" />
                            Add Condition
                        </Button>
                    </div>
                </ScrollArea>

                <SheetFooter className="px-6 py-4 border-t flex-row gap-2">
                    <Button variant="outline" onClick={handleClear} className="flex-1">
                        Clear All
                    </Button>
                    <Button onClick={handleApply} className="flex-1">
                        Apply Filters
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
