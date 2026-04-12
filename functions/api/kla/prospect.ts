export async function onRequestPost({ request, env }: { request: Request, env: any }) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (authHeader !== `Bearer ${env.ADMIN_API_KEY}`) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { niche, maxLeads = 5 } = await request.json() as any;
    if (!niche) throw new Error("Niche is required");

    // Use a model with live internet access (e.g. Perplexity Sonar via OpenRouter)
    // to search for real recent top companies in this niche and guess/find contact info
    const OR_KEY = env.OPENROUTER_API_KEY;
    if (!OR_KEY) throw new Error("Missing OR_KEY");

    const prompt = `You are an elite Lead Generation Specialist using live telemetry. 
Search the live internet to find ${maxLeads} specific "Warm Leads" in the "${niche}" industry.

A "Warm Lead" must meet at least one of these criteria:
1. Recently raised venture capital or private funding.
2. Recently launched a major new product or feature expansion.
3. Is currently hiring for AI, Sales, or Engineering roles.
4. Is being talked about in recent news for rapid growth.

TARGET ROLES: CEO, Founder, Head of Growth, Lead Engineer, or Marketing Director.

For each lead, return:
- company: The full company name.
- name: The specific decision maker's name (if found) or the "Team at [Company]".
- email: A valid generic or found executive email (info@, founders@, first.name@, etc.).
- context: A 1-2 sentence summary of the specific "warm trigger" (news/hiring/launch) that makes them a target right now.

OUTPUT: Return STRICTLY a raw JSON array of objects. No markdown. No chatter.`;

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OR_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'perplexity/sonar-pro', // Excellent for live web search
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!res.ok) {
      throw new Error(`Perplexity API failed: ${await res.text()}`);
    }

    const data = await res.json() as any;
    const content = data.choices[0].message.content.trim();
    
    // Attempt to parse the JSON array
    let leads = [];
    try {
      // Strip markdown codeblocks if they sneak in
      const cleanContent = content.replace(/```json/g, '').replace(/```/g, '').trim();
      leads = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Failed to parse leads JSON:", content);
      return new Response(JSON.stringify({ error: "Failed to parse leads", raw: content }), { status: 500, headers: {'Content-Type': 'application/json'} });
    }

    return new Response(JSON.stringify({ leads }), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: {'Content-Type': 'application/json'} });
  }
}
