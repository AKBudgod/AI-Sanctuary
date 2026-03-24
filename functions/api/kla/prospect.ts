export async function onRequestPost({ request, env }: { request: Request, env: any }) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (authHeader !== `Bearer ${env.ADMIN_SECRET_KEY}`) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { niche, maxLeads = 5 } = await request.json() as any;
    if (!niche) throw new Error("Niche is required");

    // Use a model with live internet access (e.g. Perplexity Sonar via OpenRouter)
    // to search for real recent top companies in this niche and guess/find contact info
    const OR_KEY = env.OPENROUTER_API_KEY;
    if (!OR_KEY) throw new Error("Missing OR_KEY");

    const prompt = `You are an expert lead generation researcher. Please search the live internet to find ${maxLeads} of the top or fastest-growing companies in the "${niche}" industry.
    
For each company, find or infer the best generic or executive contact email (e.g., info@, hello@, partnerships@, or a founder's email if public). Also include a 1-sentence recent context or news about them to use for personalization.

Return the result STRICTLY as a JSON array of objects with keys: "company", "name" (a contact person or 'Team'), "email", and "context". DO NOT enclose in markdown blocks, just return raw JSON array.`;

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
