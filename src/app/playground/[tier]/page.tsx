import React from 'react';
import SingleTierPlayground from '@/components/ui/SingleTierPlayground';

export function generateStaticParams() {
    return [
        { tier: 'explorer' },
        { tier: 'adept' },
        { tier: 'master' },
        { tier: 'developer' },
    ];
}

export default function Page({ params }: { params: { tier: string } }) {
    return <SingleTierPlayground initialTier={params.tier} />;
}
