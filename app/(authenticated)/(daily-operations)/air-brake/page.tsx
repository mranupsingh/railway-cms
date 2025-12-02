import AirBrakeTesting from '@/components/authenticated/daily-operations/air-brake-testing';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Air Brake Testing Update | Railway CMS',
    description: 'Update air brake testing dates for coaches',
};

export default function AirBrakeTestingPage() {
    return (
        <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <div className="space-y-6 px-4 lg:px-6">
                    <AirBrakeTesting />
                </div>
            </div>
        </div>
    )
}
