'use client';

import { useEffect, useRef } from 'react';

export default function ActivityTracker() {
    const lastActivityTime = useRef(Date.now());
    const lastHeartbeatTime = useRef(0);

    useEffect(() => {
        // 10 minutes cutoff for inactivity
        const INACTIVITY_LIMIT_MS = 10 * 60 * 1000;
        // Heartbeat every 1 minute of active time
        const HEARTBEAT_INTERVAL_MS = 60 * 1000;

        const updateActivity = () => {
            lastActivityTime.current = Date.now();
        };

        // Track standard user interactions
        window.addEventListener('mousemove', updateActivity);
        window.addEventListener('keydown', updateActivity);
        window.addEventListener('click', updateActivity);
        window.addEventListener('scroll', updateActivity);
        window.addEventListener('touchstart', updateActivity);

        const intervalId = setInterval(() => {
            const now = Date.now();
            const timeSinceLastActivity = now - lastActivityTime.current;
            const timeSinceLastHeartbeat = now - lastHeartbeatTime.current;

            // Ensure the user has been active recently AND it's been at least a minute since we sent a beat
            if (timeSinceLastActivity < INACTIVITY_LIMIT_MS && timeSinceLastHeartbeat >= HEARTBEAT_INTERVAL_MS) {
                const userEmail = localStorage.getItem('user_email');
                if (userEmail) {
                    fetch('/api/tiers', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${userEmail}`,
                        },
                        body: JSON.stringify({ action: 'heartbeat' }),
                    }).catch(() => {
                        // Ignore minor network failures for heartbeats
                    });
                }
                lastHeartbeatTime.current = now;
            }
        }, 10000); // Check every 10 seconds if a heartbeat is due

        return () => {
            window.removeEventListener('mousemove', updateActivity);
            window.removeEventListener('keydown', updateActivity);
            window.removeEventListener('click', updateActivity);
            window.removeEventListener('scroll', updateActivity);
            window.removeEventListener('touchstart', updateActivity);
            clearInterval(intervalId);
        };
    }, []);

    return null; // Hidden background component
}
