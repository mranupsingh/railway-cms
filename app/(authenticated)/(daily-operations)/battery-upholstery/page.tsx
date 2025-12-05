import BatteryUpholstery from '@/components/authenticated/daily-operations/battery-upholstery';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Battery & Upholstery Status | Railway CMS',
    description: 'Update Battery and Upholstery Status for coaches',
};

export default function BatteryUpholsteryPage() {
    return (
        <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <div className="space-y-6 px-4 lg:px-6">
                    <BatteryUpholstery />
                </div>
            </div>
        </div>
    )
}
