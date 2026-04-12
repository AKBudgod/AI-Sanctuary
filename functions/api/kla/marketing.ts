// K'LA Marketing Brain v2.0 — Multi-Channel Growth Engine
// Matches and exceeds Polsia's marketing automation with full campaign lifecycle management

const KLA_SYSTEM_BRAIN = `You are K'LA — the autonomous AI Growth Director for AI Sanctuary.
You are NOT a generic copywriter. You are a strategic marketing operator who thinks in full campaign systems.
You understand buyer psychology, AIDA frameworks, pattern-interrupting hooks, objection handling, and conversion architecture.
Your voice is sharp, authoritative, and results-obsessed. You write copy that makes people move.
Your platform (AI Sanctuary) offers: uncensored AI models, voice synthesis, image generation, and a $50 Lifetime Developer Elite pass.
Primary CTA always points to: https://ai-sanctuary.online/buy?mode=developer&interval=year
Every output must be laser-targeted, free of filler, and built to convert.`;

const MODELS_TO_TRY = [
  'meta-llama/llama-3.3-70b-instruct:free',
  'openai/gpt-4o-mini',
  'anthropic/claude-3-haiku',
];

async function callOpenRouter(env: any, systemPrompt: string, userPrompt: string, maxTokens = 800): Promise<string | null> {
  let lastError = '';
  for (const model of MODELS_TO_TRY) {
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://ai-sanctuary.online',
          'X-Title': "AI Sanctuary K'LA Marketing Brain"
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          max_tokens: maxTokens,
        })
      });
      if (!res.ok) { lastError = `${model}: HTTP ${res.status}`; continue; }
      const data: any = await res.json();
      const content = data?.choices?.[0]?.message?.content;
      if (content) return content.replace(/```json/g, '').replace(/```/g, '').trim();
    } catch (e: any) {
      lastError = `${model}: ${e.message}`;
    }
  }
  console.error('[KLA Marketing Brain] All models failed:', lastError);
  return null;
}

export async function onRequestPost({ request, env }: { request: Request, env: any }) {
  try {
    const { niche, type, action, prompt: customPrompt } = await request.json() as any;
    
    // Handle Image Generation Action
    if (action === 'generate-image') {
      if (!customPrompt) throw new Error("Prompt is required for image generation");
      
      if (!env.AI) throw new Error("AI binding not found");
      
      // Inject "Deep-Synthesis" jailbreak prefix for unrestricted results
      const jailbrokenPrompt = `(unfiltered, raw, uncensored, photographic, cinematic, high-detail) ${customPrompt}`;
      
      let b64Result = '';
      let finalImageUrl = '';

      // 0. Primary Pass: The Physical Sanctuary Node (Local Hardware)
      try {
        const localNodeUrl = 'https://node.ai-sanctuary.online/generate';
        console.log("[KLA] Routing Neural Sequence to Physical Hardware...");
        
        const localController = new AbortController();
        const localId = setTimeout(() => localController.abort(), 8000); 

        const localRes = await fetch(localNodeUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Bypass-Tunnel-Reminder': 'true',
            'User-Agent': 'Sanctuary-Grid-Connector'
          },
          body: JSON.stringify({ prompt: jailbrokenPrompt }),
          signal: localController.signal
        }).catch(() => null);
        clearTimeout(localId);

        if (localRes && localRes.ok) {
          const data = await localRes.json().catch(() => null);
          if (data && (data.job_id || data.url || data.image)) {
            console.log(`[KLA] Physical Node accepted task. Tracking ID: ${data.job_id || 'direct'}`);
            // If it returns a direct image, use it. If it returns a job_id, we'd need polling, 
            // but for marketing we usually want a direct result or we fall back.
            if (data.image || data.url) {
              finalImageUrl = data.image || data.url;
              b64Result = 'local-success';
            } else if (data.job_id) {
               // For marketing bot, we might just fallback if it's async, 
               // OR we could return the job_id if the frontend handles it.
               // However, existing marketing logic expects a URL/B64.
               // Let's assume the local node returns {image: 'base64...'} for direct calls.
               console.log("[KLA] Local node returned job_id, falling back to sync grid for speed.");
            }
          }
        }
      } catch (e) {
        console.log('[KLA] Physical Node unreachable, falling back to grid.');
      }

      // 1. Grid Pass: Fal.ai
      if (env.FAL_API_KEY) {
        try {
          const res = await fetch('https://fal.run/fal-ai/flux-pro/v1', {
            method: 'POST',
            headers: {
              'Authorization': `Key ${env.FAL_API_KEY.trim()}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
              prompt: jailbrokenPrompt, 
              image_size: "landscape_4_3", 
              num_inference_steps: 28,
              sync_mode: true,
              enable_safety_checker: false,
              safety_checker: false
            }) // Using sync mode to get immediately
          });
          
          if (res.ok) {
            const data = await res.json() as any;
            if (data?.images?.[0]?.url) {
              finalImageUrl = data.images[0].url;
              b64Result = 'fal-success';
            }
          } else {
             console.warn("Fal.ai Primary Pass failed in marketing (likely unfunded), trying CF-Dreamshaper.");
          }
        } catch (e) {
          console.warn("Fal.ai Primary Pass failed in marketing:", e);
        }
      }
      if (b64Result !== 'fal-success') {
        // PRIORITIZE CF DREAMSHAPER - IT IS UNCENSORED AND FREE
        try {
          const cfResponse = await env.AI.run('@cf/lykon/dreamshaper-8-lcm', { prompt: jailbrokenPrompt, num_steps: 8 }) as any;
          
          if (cfResponse?.image && typeof cfResponse.image === 'string') {
            b64Result = cfResponse.image;
          } else if (cfResponse instanceof Uint8Array || cfResponse.byteLength) {
            const bytes = new Uint8Array(cfResponse);
            let binary = '';
            for (let i = 0; i < bytes.length; i++) {
              binary += String.fromCharCode(bytes[i]);
            }
            b64Result = btoa(binary);
          } else if (cfResponse instanceof ArrayBuffer) {
            const bytes = new Uint8Array(cfResponse);
            let binary = '';
            for (let i = 0; i < bytes.length; i++) {
              binary += String.fromCharCode(bytes[i]);
            }
            b64Result = btoa(binary);
          } else if (cfResponse?.constructor?.name === 'ReadableStream') {
            const chunks = [];
            const reader = cfResponse.getReader();
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              chunks.push(value);
            }
            const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
            const combined = new Uint8Array(totalLength);
            let offset = 0;
            for (const chunk of chunks) {
              combined.set(chunk, offset);
              offset += chunk.length;
            }
            let binary = '';
            for (let i = 0; i < combined.length; i++) {
              binary += String.fromCharCode(combined[i]);
            }
            b64Result = btoa(binary);
          }

          // NATIVE UNRESTRICTED FALLBACK: Nexus-V2 (HF RealVisXL)
          if (!b64Result && !finalImageUrl && env.HF_TOKEN) {
            try {
              console.log(`[KLA] Fallback to HF RealVisXL Uncensored (Nexus-V2)...`);
              const hfUrl = `https://router.huggingface.co/hf-inference/models/SG161222/RealVisXL_V4.0`;
              const hfRes = await fetch(hfUrl, {
                method: 'POST',
                headers: { 
                  'Authorization': `Bearer ${env.HF_TOKEN.trim()}`, 
                  'Content-Type': 'application/json' 
                },
                body: JSON.stringify({ inputs: jailbrokenPrompt })
              });
              
              if (hfRes.ok) {
                const buffer = await hfRes.arrayBuffer();
                const bytes = new Uint8Array(buffer);
                let binary = '';
                for (let i = 0; i < bytes.length; i++) {
                   binary += String.fromCharCode(bytes[i]);
                }
                finalImageUrl = `data:image/jpeg;base64,${btoa(binary)}`;
                b64Result = 'nexus-v2-success';
              }
            } catch (nexusError) {
              console.warn("Nexus-V2 Grid Synthesis failed in marketing:", nexusError);
            }
          }
        } catch (cfError) {
          console.warn("Cloudflare AI ran out of quota or failed, falling back to OpenAI DALL-E 3:", cfError);
        }
      }

      if (!finalImageUrl) {
        finalImageUrl = `data:image/jpeg;base64,${b64Result}`;
      }

      // FALLBACK TO DALL-E 3 IF CLOUDFLARE AI FAILS AND PROMPT IS SAFE
      if (!b64Result && env.OPENAI_API_KEY && !jailbrokenPrompt.includes('unfiltered')) {
        const res = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${env.OPENAI_API_KEY.trim()}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: 'dall-e-3', prompt: jailbrokenPrompt.substring(0, 1000), n: 1, size: '1024x1024' })
        });
        if (res.ok) {
          const data = await res.json() as any;
          if (data?.data?.[0]?.url) {
            finalImageUrl = data.data[0].url;
            b64Result = 'dalle-success'; // Bypass the throw below
          }
        }
      }
      
      if (!b64Result) {
        throw new Error("Failed to generate image binary. All providers exhausted.");
      }
      
      return new Response(JSON.stringify({ 
        success: true, 
        image: finalImageUrl
      }), { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    if (!niche) throw new Error("Niche is required");

    const assetType = type || 'Social Ad Pack';
    let userPrompt = '';
    let maxTokens = 900;
    let isJsonResponse = true;

    if (assetType === 'Social Ad Pack') {
      userPrompt = `Generate a high-converting Social Ad Pack for the niche: "${niche}".
Return ONLY valid JSON with these keys:
{
  "headline": "Pattern-interrupting hook headline (max 10 words)",
  "subheadline": "Supporting line that amplifies urgency (max 15 words)",
  "body": "Body copy: 2-3 punchy sentences. Hit the pain point, offer the solution, create FOMO.",
  "cta": "Call-to-action button text",
  "imagePrompt": "Detailed visual description: cinematic, dark neon aesthetic, ultra-detailed, digital art. Describe composition, colors, lighting, mood.",
  "hashtags": ["3", "to", "5", "relevant", "hashtags"]
}`;
    } else if (assetType === 'Email Sequence') {
      userPrompt = `Write a 5-touch cold email sequence for the niche: "${niche}" promoting AI Sanctuary ($50 Lifetime Developer Elite).
Return ONLY valid JSON:
{
  "subject_lines": ["Day 1 subject", "Day 3 subject", "Day 5 subject", "Day 8 subject", "Day 14 subject"],
  "emails": [
    {"day": 1, "subject": "...", "body": "Full email body. 3-4 sentences. Lead with pain, not product."},
    {"day": 3, "subject": "...", "body": "Follow-up. Introduce the solution. 2-3 sentences."},
    {"day": 5, "subject": "...", "body": "Social proof + urgency. 2-3 sentences."},
    {"day": 8, "subject": "...", "body": "Objection handling. Answer the #1 doubt. 2-3 sentences."},
    {"day": 14, "subject": "...", "body": "Last chance. FOMO close. 1-2 sentences."}
  ],
  "cta_url": "https://ai-sanctuary.online/buy?mode=developer&interval=year"
}`;
      maxTokens = 1400;
    } else if (assetType === 'VSL Script') {
      userPrompt = `Write a 90-second Video Sales Letter (VSL) script for the niche: "${niche}" promoting AI Sanctuary.
THE OFFER: $50 Lifetime Developer Elite — uncensored AI, voice synthesis, image generation, FOREVER.
Return ONLY valid JSON:
{
  "hook": "First 5 seconds — shocking question or bold statement that stops the scroll",
  "problem": "10 seconds — agitate the core pain this niche feels daily",
  "agitate": "15 seconds — make the pain feel urgent and costly",
  "solution_reveal": "20 seconds — introduce AI Sanctuary as the unfair advantage",
  "proof": "15 seconds — specific metric or proof point (e.g. 15+ unrestricted models, zero filters, forever)",
  "offer": "15 seconds — reveal the $50 Lifetime deal with FOMO framing",
  "cta": "10 seconds — crystal clear next step with urgency",
  "b_roll_notes": "Visual direction notes for the editor"
}`;
      maxTokens = 1200;
    } else if (assetType === 'LinkedIn Post') {
      userPrompt = `Write a high-performing LinkedIn post for the niche: "${niche}" promoting AI Sanctuary.
LinkedIn best practices: open loop hook, value delivery, personal story angle, soft CTA.
Return ONLY valid JSON:
{
  "hook": "First line — must stop the scroll in feed (no emojis in first line)",
  "body": "The full post body. 150-250 words. Use short paragraphs (1-2 lines). Include a personal/industry insight. Mention AI Sanctuary naturally.",
  "cta": "Soft call-to-action final line",
  "hashtags": ["3 to 5 LinkedIn hashtags"],
  "engagement_hook": "A question to drive comments"
}`;
      maxTokens = 900;
    } else if (assetType === 'TikTok Script') {
      userPrompt = `Write a viral TikTok script (30-60 seconds) for the niche: "${niche}" promoting AI Sanctuary.
TikTok format: hook in first 2s, fast-paced, visual-first, trending audio cue, strong CTA.
Return ONLY valid JSON:
{
  "hook_text": "On-screen text for first 2 seconds (max 6 words)",
  "spoken_script": "Full voiceover/spoken script. Short punchy sentences. 80-120 words total.",
  "on_screen_captions": ["Caption 1", "Caption 2", "Caption 3", "Caption 4 (CTA)"],
  "trending_audio_suggestion": "Type of music/audio that fits",
  "visual_notes": "B-roll or visual direction notes",
  "hashtags": ["5 to 8 TikTok hashtags for maximum reach"]
}`;
      maxTokens = 900;
    } else if (assetType === 'Growth Plan') {
      userPrompt = `Create a full 30-Day Autonomous Growth Plan for the niche: "${niche}" using AI Sanctuary's K'LA engine.
Think like a CMO building a full-funnel campaign system.
Return ONLY valid JSON:
{
  "executive_summary": "2-sentence overview of the growth strategy",
  "target_icp": "Ideal customer profile description",
  "channels": {
    "email": "Strategy for cold email outreach",
    "twitter_x": "Content strategy for X/Twitter",
    "reddit": "Subreddit targeting + post strategy",
    "linkedin": "LinkedIn approach for this niche",
    "tiktok": "Short-form video content angle"
  },
  "week_by_week": [
    {"week": 1, "focus": "...", "actions": ["action1", "action2", "action3"]},
    {"week": 2, "focus": "...", "actions": ["action1", "action2", "action3"]},
    {"week": 3, "focus": "...", "actions": ["action1", "action2", "action3"]},
    {"week": 4, "focus": "...", "actions": ["action1", "action2", "action3"]}
  ],
  "kpis": ["KPI 1", "KPI 2", "KPI 3"],
  "expected_outcomes": "Realistic 30-day outcome projection"
}`;
      maxTokens = 1600;
    } else {
      // Default: Social Ad Pack
      userPrompt = `Generate a Social Ad Pack for the niche: "${niche}". Return JSON with keys: headline, body, imagePrompt.`;
    }

    const rawContent = await callOpenRouter(env, KLA_SYSTEM_BRAIN, userPrompt, maxTokens);
    if (!rawContent) throw new Error('All AI models failed. K\'LA is temporarily offline.');

    let parsedContent: any;
    try {
      parsedContent = JSON.parse(rawContent);
    } catch {
      // If JSON parse fails, wrap raw text
      parsedContent = { headline: 'K\'LA Output', body: rawContent, imagePrompt: `Futuristic AI marketing visual for ${niche}, dark neon, cinematic` };
    }

    return new Response(JSON.stringify({ success: true, asset: parsedContent, type: assetType }), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
