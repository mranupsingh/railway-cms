import '@/lib/bigint-serializer';
import prisma from '@/lib/db/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
    request: NextRequest,
    { params }: { params: { coachno: string } }
) {
    try {
        const coachno = params.coachno;
        const body = await request.json();

        // Remove fields that shouldn't be updated or are primary keys if present
        delete body.coachno;

        // Update the record
        const updatedCoach = await prisma.coach_master.update({
            where: {
                coachno: coachno,
            },
            data: body,
        });

        return NextResponse.json({
            success: true,
            data: updatedCoach,
        });
    } catch (error) {
        console.error('Error updating coach master data:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to update coach master data',
                details: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
