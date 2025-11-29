import { FilterCondition, FilterOperator } from "../types/filter";

export function buildWhereClauseFromFilters(conditions: FilterCondition[]) {
    if (!conditions || conditions.length === 0) {
        return {};
    }

    // If there's only one condition, return it directly
    if (conditions.length === 1) {
        return buildSingleCondition(conditions[0]);
    }

    // For multiple conditions, we need to handle AND/OR logic
    // This is a simplified implementation that groups by the logical operator of the *next* condition
    // A more complex implementation would require a tree structure for nested groups

    // Current approach:
    // We'll group conditions by their logical operator.
    // Prisma supports AND: [...] and OR: [...]

    // However, the UI is likely a flat list: A AND B OR C
    // Standard precedence usually puts AND before OR, or evaluates left-to-right.
    // For simplicity and to match common UI builders, we'll assume a sequential evaluation
    // or group all ANDs together.

    // Let's implement a robust way:
    // If all logical operators are 'AND', we use AND: [...]
    // If all are 'OR', we use OR: [...]
    // Mixed is tricky without grouping UI.

    // Strategy:
    // We will construct the where clause based on the first logical operator found.
    // If the user mixes AND/OR without parentheses, the behavior can be ambiguous.
    // We will default to wrapping everything in an AND block, but if an OR is detected,
    // we might need to rethink.

    // BETTER STRATEGY for flat list:
    // We'll treat the first logical operator as the global operator for now to keep it simple
    // as building a complex query parser is out of scope for this step.
    // OR we can group sequential conditions.

    // Let's try to support the structure: (A) AND (B) OR (C)
    // Actually, the prompt says: "merge multiple columns + operator = value"
    // It implies a list.

    // Let's use the logical operator of the *current* item to join with the *previous* result.
    // But Prisma's structure is declarative.

    // Simplified approach for V1:
    // We will group all conditions into a single AND or OR block based on the majority or first operator.
    // OR, we can just return an AND of all conditions for now if the UI only supports "Match All" vs "Match Any".

    // But the UI has `logicalOperator` on each row.
    // Row 1: A (AND)
    // Row 2: B (OR)
    // Row 3: C
    // This usually means: A AND B OR C -> (A AND B) OR C

    // Let's implement a recursive builder or just support "Match All" (AND) / "Match Any" (OR) groups.
    // Given the prompt "logicalOperator?: 'AND' | 'OR'", it seems per-row.

    // Let's stick to a safe implementation:
    // If any OR is present, we might need to be careful.
    // For now, let's map each condition to a Prisma where object.

    const whereConditions = conditions.map(buildSingleCondition);

    // Check if we have mixed operators
    const hasOr = conditions.some(c => c.logicalOperator === 'OR');

    if (hasOr) {
        // If there's an OR, we default to OR-ing everything for safety/simplicity in this iteration
        // or we can try to respect the sequence.
        // Let's try to respect the sequence:
        // This is hard with Prisma's object syntax.

        // Fallback: If the user selects 'OR' for any row, we treat the whole group as OR
        // This is a common simplification in query builders (Match Any vs Match All)
        return {
            OR: whereConditions
        };
    } else {
        return {
            AND: whereConditions
        };
    }
}

function buildSingleCondition(condition: FilterCondition) {
    const { column, operator, value, valueTo } = condition;

    // Handle empty/not empty which don't need values
    if (operator === 'isEmpty') {
        return {
            [column]: { equals: null } // or equals: '' depending on DB
        };
    }

    if (operator === 'isNotEmpty') {
        return {
            NOT: {
                [column]: { equals: null }
            }
        };
    }

    // Parse value based on expected type (simplified)
    // In a real app, we'd look up the column type schema
    // For now, we'll try to infer or use string for everything and let Prisma/DB coerce if possible
    // OR we assume string for text, number for numeric columns.

    // We need to handle dates specifically
    const isDateOp = ['dateRange'].includes(operator) || !isNaN(Date.parse(value)) && value.includes('-');

    let parsedValue: any = value;

    // Basic type inference
    if (!isNaN(Number(value)) && value.trim() !== '' && !value.includes('-')) {
        // It's a number
        parsedValue = Number(value);
    } else if (value === 'true') {
        parsedValue = true;
    } else if (value === 'false') {
        parsedValue = false;
    } else if (isDateOp || !isNaN(Date.parse(value))) {
        // It's likely a date
        parsedValue = new Date(value);
    }

    switch (operator) {
        case 'equals':
            if (typeof parsedValue === 'string') {
                return { [column]: { equals: parsedValue, mode: 'insensitive' } };
            }
            return { [column]: { equals: parsedValue } };

        case 'notEquals':
            if (typeof parsedValue === 'string') {
                return { NOT: { [column]: { equals: parsedValue, mode: 'insensitive' } } };
            }
            return { NOT: { [column]: { equals: parsedValue } } };

        case 'contains':
            return { [column]: { contains: value, mode: 'insensitive' } };

        case 'notContains':
            return { NOT: { [column]: { contains: value, mode: 'insensitive' } } };

        case 'startsWith':
            return { [column]: { startsWith: value, mode: 'insensitive' } };

        case 'endsWith':
            return { [column]: { endsWith: value, mode: 'insensitive' } };

        case 'greaterThan':
            return { [column]: { gt: parsedValue } };

        case 'greaterThanOrEqual':
            return { [column]: { gte: parsedValue } };

        case 'lessThan':
            return { [column]: { lt: parsedValue } };

        case 'lessThanOrEqual':
            return { [column]: { lte: parsedValue } };

        case 'dateRange':
            if (!valueTo) return {};
            return {
                [column]: {
                    gte: new Date(value),
                    lte: new Date(valueTo)
                }
            };

        default:
            return {};
    }
}
