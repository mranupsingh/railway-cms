import RemoveCoachFromYard from "@/components/authenticated/daily-operations/remove-coaches-from-yard";

export default function RemoveCoachFromYardPage() {
    return <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="space-y-6 px-4 lg:px-6">
                <RemoveCoachFromYard />
            </div>
        </div>
    </div>
}
