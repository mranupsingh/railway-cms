import prisma from '@/lib/db/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { coachno, yardindt, pohby, status, remark, remaster, duesch, lschedule } = body;

        if (!coachno) {
            return NextResponse.json(
                { success: false, error: 'Coach number is required' },
                { status: 400 }
            );
        }

        // Update coach_master
        const updatedCoach = await prisma.coach_master.update({
            where: { coachno },
            data: {
                yardindt: yardindt ? new Date(yardindt) : null,
                pohby,
                status,
                remark, // Shop remark
                remaster, // Master remark
                duesch,
                lschedule,
                // We might want to update other fields if needed, but requirements specified these.
            }
        });

        return NextResponse.json({
            success: true,
            data: updatedCoach,
            message: 'Coach details updated successfully'
        });

    } catch (error) {
        console.error('Error updating coach details:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to update coach details',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
