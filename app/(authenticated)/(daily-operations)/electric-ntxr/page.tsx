import ElectricNtxr from "@/components/authenticated/daily-operations/electric-ntxr";
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Electric and NTXR Fit | Railway CMS',
    description: 'Update Electric Fit and NTXR Fit dates for coaches',
};

export default function ElectricNtxrPage() {
    return (
        <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <div className="space-y-6 px-4 lg:px-6">
                    <ElectricNtxr />
                </div>
            </div>
        </div>
    )
}
