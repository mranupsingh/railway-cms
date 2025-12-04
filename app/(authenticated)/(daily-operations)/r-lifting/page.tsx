import RLifting from "@/components/authenticated/daily-operations/r-lifting";
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'R-Lifting Update | Railway CMS',
    description: 'Update R-Lifting dates for coaches',
};

export default function RLiftingPage() {
    return (
        <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <div className="space-y-6 px-4 lg:px-6">
                    <RLifting />
                </div>
            </div>
        </div>
    )
}
