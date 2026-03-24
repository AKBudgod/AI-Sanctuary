'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const UserDashboard = dynamic(() => import('@/components/ui/UserDashboard'), { ssr: false });

export default function DashboardPage() {
    const router = useRouter();
    const [email, setEmail] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedEmail = localStorage.getItem('user_email') || sessionStorage.getItem('user_email');
        if (!storedEmail) {
            router.replace('/playground');
            return;
        }
        setEmail(storedEmail);
        setLoading(false);
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black pt-24 px-4 pb-8">
            <UserDashboard />
        </div>
    );
}
