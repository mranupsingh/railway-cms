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

        // Sorting
        const sortBy = searchParams.get('sortBy') || 'COACHNO';
        const sortOrder = (searchParams.get('sortOrder') || 'asc') as 'asc' | 'desc';

        // Build where clause
        const where: any = {};

        if (coachno) {
            where.COACHNO = {
                contains: coachno,
                mode: 'insensitive'
            };
        }

        if (status) {
            where.STATUS = status;
        }

        if (basedepot) {
            where.BASEDEPOT = basedepot;
        }

        if (type) {
            where.TYPE = type;
        }

        // Fetch data with pagination
        const [data, total] = await Promise.all([
            prisma.history.findMany({
                where,
                skip,
                take: pageSize,
                orderBy: {
                    [sortBy]: sortOrder
                }
            }),
            prisma.history.count({ where })
        ]);

        // BigInt will automatically serialize to string
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
        console.error('Error fetching history data:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch history data',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
