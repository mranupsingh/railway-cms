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

        // Define numeric fields for conversion
        const numericFields = [
            'yrblt', 'cost', 'tweight', 'age', 'corrmhrs', 'period', 'age_rt_dt',
            'seat', 'berth', 'tankfitold', 'tankfitnew', 'ventury', 'workdays',
            'caldays', 'cond_pos'
        ];

        // Define date fields for conversion (handle empty strings)
        const dateFields = [
            'mfgdt', 'dt_placed', 'comdt', 'overagedt', 'lshopoutdt', 'retpohdt',
            'dt_ioh', 'ret_dt_ioh', 'mlrdt', 'date_rf', 'date_conv', 'yardindt',
            'shopindt', 'liftdt', 'lowerdt', 'reliftdt', 'airbkdt', 'ptindt',
            'ptoutdt', 'h_corr_dt', 'inissue', 'dcwifit', 'elecracfit', 'ntxrfit',
            'innhs1dt', 'innhs2dt', 'insp_dt', 'l_3yr_done', 'l_6yr_done',
            'l_9yr_done', 'l_3yr_due', 'l_6yr_due', 'l_9yr_due', 'uphlddt',
            'acme', 'uphundt', 'btlddt', 'btundt', 'roamsdt'
        ];

        // Process body to convert types
        for (const key of Object.keys(body)) {
            const value = body[key];

            if (numericFields.includes(key)) {
                if (value === '' || value === null || value === undefined) {
                    body[key] = null;
                } else {
                    const num = Number(value);
                    body[key] = isNaN(num) ? null : num;
                }
            } else if (dateFields.includes(key)) {
                if (value === '' || value === null || value === undefined) {
                    body[key] = null;
                }
                // Prisma handles ISO date strings correctly, so no need to convert to Date object explicitly
                // unless it's a non-standard format.
            }
        }

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
