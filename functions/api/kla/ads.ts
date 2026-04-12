// Proxy for K'LA Ad Engine
// Interfaces with the KLA-SDR Worker to generate and fetch ad assets

import { ADMIN_EMAILS } from '../models';

export const onRequest: PagesFunction<{ ADMIN_API_KEY: string; KLA_SDR_URL: string }> = async (context) => {
    const { request, env } = context;
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    const action = searchParams.get('action'); // 'generate' or 'history'
    const email = searchParams.get('email'); // The user email to manage ads for

    // CORS headers
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const authHeader = request.headers.get('Authorization');
        const adminEmail = authHeader?.replace('Bearer ', '').toLowerCase();

        if (!adminEmail || !ADMIN_EMAILS.includes(adminEmail)) {
            return new Response(JSON.stringify({ error: 'Unauthorized: Admin access required.' }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        if (!email) {
            return new Response(JSON.stringify({ error: 'Target user email is required.' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // Determine destination URL in the KLA-SDR worker
        const workerBase = env.KLA_SDR_URL || 'https://kla-sdr-engine.wjreviews420.workers.dev';
        const targetPath = action === 'generate' ? '/ads' : '/ads/history';
        const targetUrl = `${workerBase}${targetPath}?email=${encodeURIComponent(email)}`;

        console.log(`[KLA-ADS] Proxying ${action} for ${email} to ${targetUrl}`);

        const response = await fetch(targetUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${env.ADMIN_API_KEY}`,
            },
        });

        const data = await response.json();

        return new Response(JSON.stringify(data), {
            status: response.status,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        return new Response(JSON.stringify({ error: 'Proxy collapse', details: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
};

type PagesFunction<Env = any, Params extends string = any, Data = any> = (
    context: EventContext<Env, Params, Data>
) => Response | Promise<Response>;

interface EventContext<Env, Params extends string, Data> {
    request: Request;
    env: Env;
    params: Record<Params, string>;
    data: Data;
}
