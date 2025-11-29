import { buildWhereClauseFromFilters } from '@/app/lib/db/filter-utils';
import { FilterCondition } from '@/app/lib/types/filter';
import '@/lib/bigint-serializer';
import prisma from '@/lib/db/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;

        // Pagination
        const page = parseInt(searchParams.get('page') || '1');
        const pageSize = parseInt(searchParams.get('pageSize') || '10');
        const skip = (page - 1) * pageSize;

        // Filtering
        const coachno = searchParams.get('coachno');
        const status = searchParams.get('status');
        const basedepot = searchParams.get('basedepot');
        const type = searchParams.get('type');
        const filtersParam = searchParams.get('filters');

        // Sorting
        const sortBy = searchParams.get('sortBy') || 'coachno';
        const sortOrder = (searchParams.get('sortOrder') || 'asc') as 'asc' | 'desc';

        // Build where clause
        let where: any = {};

        // Handle advanced filters
        if (filtersParam) {
            try {
                const conditions: FilterCondition[] = JSON.parse(filtersParam);
                const advancedWhere = buildWhereClauseFromFilters(conditions);
                where = { ...where, ...advancedWhere };
            } catch (e) {
                console.error('Error parsing filters:', e);
            }
        }

        if (coachno) {
            where.coachno = {
                contains: coachno,
                mode: 'insensitive'
            };
        }

        if (status) {
            where.status = status;
        }

        if (basedepot) {
            where.basedepot = basedepot;
        }

        if (type) {
            where.type = type;
        }

        // Fetch data with pagination
        const [data, total] = await Promise.all([
            prisma.coach_master.findMany({
                where,
                skip,
                take: pageSize,
                orderBy: {
                    [sortBy]: sortOrder
                }
            }),
            prisma.coach_master.count({ where })
        ]);

        // Now BigInt will automatically serialize to string
        return NextResponse.json({
            success: true,
            data: {
                items: data,
                pagination: {
                    page,
                    pageSize,
                    total,
                    totalPages: Math.ceil(total / pageSize)
                }
            }
        });
    } catch (error) {
        console.error('Error fetching coach master data:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch coach master data',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
