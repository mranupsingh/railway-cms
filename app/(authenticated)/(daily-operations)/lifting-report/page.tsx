import LiftingReport from "@/components/authenticated/daily-operations/lifting-report";
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Lifting Report | Railway CMS',
    description: 'Update Lifting Report details for coaches',
};

export default function LiftingReportPage() {
    return (
        <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <div className="space-y-6 px-4 lg:px-6">
                    <LiftingReport />
                </div>
            </div>
        </div>
    )
}
