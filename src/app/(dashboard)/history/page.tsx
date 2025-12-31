import { ComingSoon } from '@/components/dashboard/ComingSoon'

export default async function HistoryPage() {
    return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
            <main className="flex-1 overflow-y-auto">
                <ComingSoon
                    title="Activity History"
                    icon="history"
                    description="The historical view of all your past training sessions, detailed transcripts, and scoring trends is currently under maintenance and will be back soon."
                />
            </main>
        </div>
    )
}
