export type FilterOperator =
    | 'equals'
    | 'notEquals'
    | 'contains'
    | 'notContains'
    | 'startsWith'
    | 'endsWith'
    | 'isEmpty'
    | 'isNotEmpty'
    | 'greaterThan'
    | 'greaterThanOrEqual'
    | 'lessThan'
    | 'lessThanOrEqual'
    | 'dateRange';

export type FilterLogicalOperator = 'AND' | 'OR';

export interface FilterCondition {
    id: string;
    column: string;
    operator: FilterOperator;
    value: string;
    valueTo?: string; // For dateRange or range operations
    logicalOperator: FilterLogicalOperator;
    type?: ColumnType;
}

export interface AdvancedFilterState {
    conditions: FilterCondition[];
}

export type ColumnType = 'string' | 'number' | 'date' | 'boolean';

export interface FilterableColumn {
    id: string;
    label: string;
    type: ColumnType;
    options?: { label: string; value: string }[]; // For select/enum fields
}

export const STRING_OPS: FilterOperator[] = [
    'equals', 'notEquals', 'contains', 'notContains',
    'startsWith', 'endsWith', 'isEmpty', 'isNotEmpty'
];

export const NUMBER_OPS: FilterOperator[] = [
    'equals', 'notEquals', 'greaterThan', 'greaterThanOrEqual',
    'lessThan', 'lessThanOrEqual', 'isEmpty', 'isNotEmpty'
];

export const DATE_OPS: FilterOperator[] = [
    'equals', 'notEquals', 'greaterThan', 'greaterThanOrEqual',
    'lessThan', 'lessThanOrEqual', 'isEmpty', 'isNotEmpty', 'dateRange'
];

export const BOOLEAN_OPS: FilterOperator[] = [
    'equals', 'notEquals'
];

export const getOperatorsForType = (type: ColumnType): FilterOperator[] => {
    switch (type) {
        case 'string': return STRING_OPS;
        case 'number': return NUMBER_OPS;
        case 'date': return DATE_OPS;
        case 'boolean': return BOOLEAN_OPS;
        default: return STRING_OPS;
    }
};

export const getOperatorLabel = (op: FilterOperator): string => {
    switch (op) {
        case 'equals': return 'Equals';
        case 'notEquals': return 'Does not equal';
        case 'contains': return 'Contains';
        case 'notContains': return 'Does not contain';
        case 'startsWith': return 'Starts with';
        case 'endsWith': return 'Ends with';
        case 'isEmpty': return 'Is empty';
        case 'isNotEmpty': return 'Is not empty';
        case 'greaterThan': return 'Greater than';
        case 'greaterThanOrEqual': return 'Greater than or equal to';
        case 'lessThan': return 'Less than';
        case 'lessThanOrEqual': return 'Less than or equal to';
        case 'dateRange': return 'Date range';
        default: return op;
    }
};
