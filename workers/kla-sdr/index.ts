// K'LA Multi-Tenant SDR Engine v3.0
// Processes multiple users' campaigns asynchronously using their own OAuth tokens.
// Cron: 4x per day (8am, noon, 4pm, 8pm UTC)

import { Client, type ClientConfig } from '@xdevplatform/xdk';

const TARGET_SUBREDDITS = [
  'startup', 'SaaS', 'Entrepreneur', 'growthhacking', 'marketing', 'AIAssistants', 'LocalLLaMA'
];

export default {
  async scheduled(event: any, env: any, ctx: any) {
    const hour = new Date().getUTCHours();
    console.log(`K'LA Multi-Tenant Engine — Cron triggered at hour ${hour} UTC`);

    try {
      // 1. Fetch all missions
      const list = await env.KLA_LEADS_KV.list({ prefix: 'mission:' });
      
      // Group by user (email) to pick 1 active mission per user
      const userMissions = new Map<string, any>();
      
      for (const key of list.keys) {
        const dataStr = await env.KLA_LEADS_KV.get(key.name);
        if (!dataStr) continue;
        try {
          const mission = JSON.parse(dataStr);
          if (mission.status === 'Active' && !userMissions.has(mission.email)) {
            userMissions.set(mission.email, mission);
          }
        } catch(e) {}
      }

      console.log(`Found ${userMissions.size} users with active missions.`);

      // 2. Process all users concurrently
      const promises = Array.from(userMissions.values()).map(mission => processUserMission(mission, env, hour));
      const results = await Promise.allSettled(promises);
      
      console.log(`Finished processing ${results.length} missions.`);

    } catch (error: any) {
      console.error("K'LA Engine Global Error:", error.message);
    }
  },

  // HTTP handler — allows manual trigger from Dashboard for a specific user
  async fetch(request: Request, env: any): Promise<Response> {
    const url = new URL(request.url);
    const authHeader = request.headers.get('Authorization');
    
    // Simple admin auth for now
    if (authHeader !== `Bearer ${env.ADMIN_API_KEY}`) {
      return new Response('Unauthorized', { status: 401 });
    }

    if (url.pathname === '/blast') {
      const hour = new Date().getUTCHours();
      await this.scheduled(null, env, null);
      return new Response(JSON.stringify({ success: true, message: "Global blast triggered" }), { headers: { 'Content-Type': 'application/json' } });
    }

    if (url.pathname === '/ads') {
      const email = url.searchParams.get('email');
      if (!email) return new Response('Email required', { status: 400 });
      
      const missionData = await env.KLA_LEADS_KV.get(`mission:${email}`);
      if (!missionData) return new Response('Mission not found', { status: 404 });
      
      const mission = JSON.parse(missionData);
      const ads = await generateAdCampaign(env, mission.productUrl || 'https://ai-sanctuary.online', mission.valueProp || 'Uncensored AI');
      
      if (ads) {
        await env.KLA_LEADS_KV.put(`ads:${email}`, JSON.stringify({ ...ads, timestamp: new Date().toISOString() }));
        return new Response(JSON.stringify({ success: true, ads }), { headers: { 'Content-Type': 'application/json' } });
      }
      return new Response('Ad generation failed', { status: 500 });
    }

    if (url.pathname === '/ads/history') {
      const email = url.searchParams.get('email');
      if (!email) return new Response('Email required', { status: 400 });
      const ads = await env.KLA_LEADS_KV.get(`ads:${email}`);
      return new Response(ads || '{}', { headers: { 'Content-Type': 'application/json' } });
    }

    if (url.pathname === '/history') {
      // For global history on the admin dashboard, just return the newest post
      // In a real app we'd fetch the specific user's history
      const latest = await env.KLA_LEADS_KV.get('latest_global_post');
      return new Response(latest || '{}', { headers: { 'Content-Type': 'application/json' } });
    }

    return new Response('K\'LA SDR Multi-Tenant v3.0 Online', { status: 200 });
  }
};

async function processUserMission(mission: any, env: any, hour: number) {
  const email = mission.email;
  console.log(`Processing mission for ${email}`);

  try {
    // Check OAuth connections
    const xTokenStr = await env.KLA_LEADS_KV.get(`oauth:x:${email}`);
    const redditTokenStr = await env.KLA_LEADS_KV.get(`oauth:reddit:${email}`);
    
    if (!xTokenStr && !redditTokenStr) {
      console.log(`User ${email} has no connected accounts. Skipping.`);
      return;
    }

    // Generate specific content for their product
    const content = await generateMarketingContent(env, mission.productUrl || 'https://ai-sanctuary.online', mission.valueProp || 'Awesome AI tool');
    if (!content) throw new Error("Content generation failed");

    const tasks = [];

    // Dispatch to X
    if (xTokenStr) {
      const xAuth = JSON.parse(xTokenStr);
      tasks.push(postToXOAuth2(content.x, xAuth.access_token).catch(e => `X Error: ${e.message}`));
    } else if (env.X_BEARER_TOKEN && (email === 'weedj747@gmail.com' || email === 'wjreviews420@gmail.com' || email === 'akbudgod@ai-sanctuary.online')) {
      // Fallback to Global App-only or User Bearer for Admin
      tasks.push(postToXOAuth2(content.x, env.X_BEARER_TOKEN).catch(e => `X Global Error: ${e.message}`));
    } else {
      tasks.push(Promise.resolve("X skipped (not connected)"));
    }

    // Dispatch to Reddit
    if (redditTokenStr) {
      const redditAuth = JSON.parse(redditTokenStr);
      tasks.push(postToRedditOAuth2(content.reddit, redditAuth.access_token, hour).catch(e => `Reddit Error: ${e.message}`));
    } else {
      tasks.push(Promise.resolve("Reddit skipped (not connected)"));
    }

    const [xResult, redditResult] = await Promise.allSettled(tasks);

    const summary = {
      date: new Date().toISOString(),
      hour,
      email,
      x: xResult.status === 'fulfilled' ? xResult.value : (xResult as any).reason,
      reddit: redditResult.status === 'fulfilled' ? redditResult.value : (redditResult as any).reason,
      content,
    };

    // Save history for the user
    await env.KLA_LEADS_KV.put(`latest_global_post`, JSON.stringify(summary)); // For demo dashboard
    await env.KLA_LEADS_KV.put(`posts:${email}:${Date.now()}`, JSON.stringify(summary), { expirationTtl: 604800 });

  } catch (err: any) {
    console.error(`Error processing ${email}: ${err.message}`);
  }
}

// ═══════════════════════════════════════════════════════
// CONTENT GENERATION — K'LA Strategic Growth Brain v2
// ═══════════════════════════════════════════════════════

const KLA_SDR_BRAIN = `You are K'LA, the autonomous AI Growth Director for AI Sanctuary.
You are a strategic content operator, not a spammer. You write platform-native content that delivers genuine value first, then converts.
Platform: AI Sanctuary (https://ai-sanctuary.online) — uncensored AI models, voice synthesis, image generation.
Offer: $50 Lifetime Developer Elite — one-time payment, forever access to 15+ unrestricted models.
You write copy that sounds human, builds trust, and converts high-intent audiences.
Never be generic. Always be specific to the platform's culture and the audience's actual problems.`;

async function generateMarketingContent(env: any, productUrl: string, valueProp: string) {
  const hour = new Date().getUTCHours();
  
  // Rotate content angles to avoid repetition and platform fatigue
  const contentAngles = [
    { angle: 'pain-point', description: 'Lead with a specific frustration developers face with censored AI tools' },
    { angle: 'comparison', description: 'Compare what censored AI refuses vs what AI Sanctuary allows' },
    { angle: 'use-case', description: 'Show a specific, vivid use case that only uncensored AI enables' },
    { angle: 'roi', description: 'Frame the $50 lifetime deal as an obvious financial no-brainer vs monthly subscriptions' },
    { angle: 'social-proof', description: 'Write as if sharing an insight the community would genuinely find valuable' },
  ];
  const selectedAngle = contentAngles[hour % contentAngles.length];

  const prompt = `Using the content angle "${selectedAngle.angle}" — ${selectedAngle.description} — create platform-optimized marketing content.

Product URL: ${productUrl}
Value Proposition: ${valueProp}

OFFER DETAILS: $50 ONE-TIME Lifetime Developer Elite Pass. Includes: 15+ unrestricted AI models (Llama 3, Mistral, Claude equivalents), uncensored voice synthesis, Flux image generation, zero corporate filters, forever.
CTA Link: https://ai-sanctuary.online/buy?mode=developer&interval=year

PLATFORM REQUIREMENTS:
- X/Twitter: Feels like a genuine hot take or insight. 200-240 chars. 2-3 hashtags. Conversational but authoritative. Hook in first 5 words.
- Reddit: Reads like a community member genuinely sharing something useful, NOT an ad. Add real value in the body (tips, insights, honest framing). The CTA should feel like a natural recommendation, not a pitch. 4-6 paragraphs.

Return ONLY valid JSON:
{
  "x": "Tweet text (max 240 chars, 2-3 hashtags, include the link)",
  "reddit": {
    "title": "Reddit title that gets upvotes — specific, value-first, no clickbait",
    "body": "Reddit post body — 4-6 paragraphs. Start with genuine value or insight. Mention AI Sanctuary authentically mid-way. End with CTA to https://ai-sanctuary.online/buy?mode=developer&interval=year"
  }
}`;

  const MODELS_TO_TRY = [
    'meta-llama/llama-3.3-70b-instruct:free',
    'openai/gpt-4o-mini',
    'anthropic/claude-3-haiku',
  ];

  let data: any = null;
  let lastError = '';

  for (const model of MODELS_TO_TRY) {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://ai-sanctuary.online',
        'X-Title': "K'LA Growth Brain SDR v2"
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: KLA_SDR_BRAIN },
          { role: 'user', content: prompt }
        ],
        max_tokens: 900,
      })
    });

    if (!res.ok) {
      lastError = await res.text();
      console.error(`[SDR Content] Model ${model} failed:`, lastError);
      continue;
    }
    data = await res.json();
    if (data?.choices?.[0]?.message?.content) break;
  }

  if (!data?.choices?.[0]?.message?.content) {
    console.error(`[SDR Content] All models failed. Last error: ${lastError}`);
    return null;
  }
  const raw = data.choices?.[0]?.message?.content || '';
  try {
    const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

async function generateAdCampaign(env: any, productUrl: string, valueProp: string) {
  const prompt = `Act as an Elite Ad Agency Director. Generate a high-performing Google Search Ad campaign for:
Product URL: ${productUrl}
Value Proposition: ${valueProp}

URGENCY: This is for a "$50 LIFETIME Developer Elite" FLASH SALE.
DURATION: Next week only! 
THE OFFER: A one-time $50 payment grants LIFETIME access to the entire Sanctuary.
The goal is 1,000 sales by the end of the week.
Target high-intent developers and tech CEOs.

Requirements:
- 3 Headlines (max 30 chars each, must include "$50" or "Flash Sale")
- 2 Descriptions (max 90 chars each)
- 10 High-intent Keywords
- 1 Compelling Slogan

Return valid JSON only:
{
  "headlines": ["...", "...", "..."],
  "descriptions": ["...", "..."],
  "keywords": ["...", "..."],
  "slogan": "..."
}`;

  const MODELS_TO_TRY = [
    'meta-llama/llama-3.3-70b-instruct:free',
    'openai/gpt-4o-mini',
  ];

  let data: any = null;
  let lastError = '';

  for (const model of MODELS_TO_TRY) {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
      })
    });

    if (!res.ok) {
      lastError = await res.text();
      console.error(`[SDR AdCampaign] Model ${model} failed:`, lastError);
      continue;
    }
    data = await res.json();
    if (data?.choices?.[0]?.message?.content) break;
  }

  if (!data?.choices?.[0]?.message?.content) {
    console.error(`[SDR AdCampaign] All models failed. Last error: ${lastError}`);
    return null;
  }
  const raw = data.choices?.[0]?.message?.content || '';
  try {
    const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

// ═══════════════════════════════════════════════════════
// X (TWITTER) — OAuth 2.0 PKCE User Context via @xdevplatform/xdk
// ═══════════════════════════════════════════════════════
async function postToXOAuth2(tweet: string, accessToken: string): Promise<string> {
  const config: ClientConfig = { bearerToken: accessToken };
  const client: Client = new Client(config);

  try {
    const res = await client.posts.create({ text: tweet });
    return `Posted tweet ID: ${res.data?.id || 'unknown'}`;
  } catch (err: any) {
    throw new Error(`X API Error: ${err.message}`);
  }
}

// ═══════════════════════════════════════════════════════
// REDDIT — OAuth 2.0 User Context
// ═══════════════════════════════════════════════════════
async function postToRedditOAuth2(post: { title: string; body: string }, accessToken: string, hour: number): Promise<string> {
  const subredditIndex = Math.floor(hour / 6) % TARGET_SUBREDDITS.length;
  const subreddit = TARGET_SUBREDDITS[subredditIndex];

  const submitRes = await fetch('https://oauth.reddit.com/api/submit', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': `KLA-Marketing-SaaS/3.0`,
    },
    body: new URLSearchParams({
      api_type: 'json',
      kind: 'self',
      sr: subreddit,
      title: post.title,
      text: post.body,
      resubmit: 'true',
      nsfw: 'true',
    }).toString(),
  });

  if (!submitRes.ok) {
     throw new Error(`Reddit auth failing: ${await submitRes.text()}`);
  }

  const submitData: any = await submitRes.json();
  if (submitData?.json?.errors?.length > 0) {
    throw new Error(`Reddit error: ${JSON.stringify(submitData.json.errors)}`);
  }

  const postUrl = submitData?.json?.data?.url || 'unknown';
  return `Posted to r/${subreddit}: ${postUrl}`;
}
