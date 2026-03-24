'use client';

import { useEffect, useState } from 'react';
import VoiceSynthesizer from '@/components/ui/VoiceSynthesizer';

export default function SynthesizerPage() {
  const [userEmail, setUserEmail] = useState<string | undefined>(undefined);

  useEffect(() => {
    const email = localStorage.getItem('user_email') ?? undefined;
    setUserEmail(email);
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="absolute inset-0 aurora-bg opacity-[0.05] pointer-events-none" />
      <div className="container mx-auto px-6 relative z-10">
        <VoiceSynthesizer userEmail={userEmail} />
      </div>
    </div>
  );
}
