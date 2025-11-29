import '@/lib/bigint-serializer';
import prisma from '@/lib/db/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        const body = await request.json();

        // Update the history record
        const updatedHistory = await prisma.history.update({
            where: { id },
            data: body
        });

        return NextResponse.json({
            success: true,
            data: updatedHistory
        });
    } catch (error) {
        console.error('Error updating history record:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to update history record',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
