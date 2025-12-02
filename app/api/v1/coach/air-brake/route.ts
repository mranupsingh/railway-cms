import prisma from '@/lib/db/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { coachNos, airBrakeDate } = body;

        if (!coachNos || !Array.isArray(coachNos) || coachNos.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Coach numbers are required' },
                { status: 400 }
            );
        }

        if (!airBrakeDate) {
            return NextResponse.json(
                { success: false, error: 'Air Brake Date is required' },
                { status: 400 }
            );
        }

        // Update coach_master
        const result = await prisma.coach_master.updateMany({
            where: {
                coachno: {
                    in: coachNos
                }
            },
            data: {
                airbkdt: new Date(airBrakeDate)
            }
        });

        return NextResponse.json({
            success: true,
            data: result,
            message: `${result.count} coaches updated successfully`
        });

    } catch (error) {
        console.error('Error updating air brake date:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to update air brake date',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
