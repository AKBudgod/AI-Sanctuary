'use client';

import dynamic from 'next/dynamic';

const UnifiedPlayground = dynamic(() => import('@/components/ui/UnifiedPlayground'), {
    ssr: false,
    loading: () => <div className="h-96 md:h-64 rounded-2xl animate-pulse glass border-white/5" />,
});

export default function PlaygroundPage() {
    return (
        <div className="min-h-screen bg-black pt-24 px-4 pb-4">
            <UnifiedPlayground />
        </div>
    );
}
