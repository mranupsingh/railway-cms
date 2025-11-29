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

        // Define numeric fields for conversion
        const numericFields = [
            'YRBLT', 'TWEIGHT', 'AGE', 'CORRMHRS', 'PERIOD', 'AGE_RT_DT',
            'TANKFITOLD', 'TANKFITNEW', 'VENTURY', 'WORKDAYS', 'CALDAYS',
            'COND_POS', 'SERVICE', 'COST', 'SEAT', 'BERTH'
        ];

        // Define date fields for conversion (handle empty strings)
        const dateFields = [
            'MFGDT', 'LSHOPOUTDT', 'RETPOHDT', 'DT_IOH', 'RET_DT_IOH',
            'YARDINDT', 'SHOPINDT', 'LIFTDT', 'LOWERDT', 'RELIFTDT',
            'AIRBKDT', 'PTINDT', 'HPPTOUTDT', 'HPPTINDT', 'PTOUTDT',
            'RMPUDT', 'H_CORR_DT', 'INISSUE', 'DATE_COND', 'DCWIFIT',
            'ELECRACFIT', 'NTXRFIT', 'ISSUEDT', 'C_R', 'ROAMSDT',
            'ACME', 'INSP_DT', 'ROAMSOUTDT'
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
            }
        }

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
