import BioTank from "@/components/authenticated/daily-operations/bio-tank";
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Bio-tank Update | Railway CMS',
    description: 'Update Bio-tank Unload and Load dates for coaches',
};

export default function BioTankPage() {
    return (
        <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <div className="space-y-6 px-4 lg:px-6">
                    <BioTank />
                </div>
            </div>
        </div>
    )
}
