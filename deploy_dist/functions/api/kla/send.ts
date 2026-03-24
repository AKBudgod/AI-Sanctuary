export async function onRequestPost({ request, env }: { request: Request, env: any }) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (authHeader !== `Bearer ${env.ADMIN_SECRET_KEY}`) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { lead } = await request.json() as any;
    if (!lead || !lead.email) {
      throw new Error("Lead data and email are required");
    }

    // 1. Write the highly personalized email using GPT-4o
    const OR_KEY = env.OPENROUTER_API_KEY;
    if (!OR_KEY) throw new Error("Missing OR_KEY");

    const prompt = `You are K'LA (Kayla), an elite AI Sales Development Representative working for AI Sanctuary.
You need to write a highly personalized, natural, and compelling cold outreach email to this lead:
- Contact Name: ${lead.name}
- Company: ${lead.company}
- Recent Context/News: ${lead.context}

Your ultimate goal is to introduce them to AI Sanctuary (which provides custom autonomous AI Agents like yourself, advanced image generators, and voice synthesizers) and get them to reply or book a meeting. 
Keep it under 150 words. Do not sound completely robotic. Reference their specific context naturally immediately in the first line. 
Start exactly with "Subject: [Your creative subject here]" on the first line. Followed by a blank line, then the body.

Sign off as:
K'LA
AI Growth Engine
AI Sanctuary`;

    const aiRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OR_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o', 
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!aiRes.ok) {
      throw new Error(`AI Writer failed: ${await aiRes.text()}`);
    }

    const aiData = await aiRes.json() as any;
    const emailDraft = aiData.choices[0].message.content.trim();

    // Parse out subject and body
    const parts = emailDraft.split('\n\n');
    let subject = "Quick question about your AI strategy";
    let body = emailDraft;

    if (parts[0].toLowerCase().startsWith('subject:')) {
      subject = parts[0].substring(8).trim();
      body = parts.slice(1).join('\n\n').trim();
    }

    // Convert newlines to HTML-friendly <br> for the email body
    const htmlBody = body.replace(/\n/g, '<br/>');

    // 2. Dispatch via Cloudflare MailChannels
    const mcReq = await fetch('https://api.mailchannels.net/tx/v1/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: lead.email, name: lead.name }],
          },
        ],
        from: {
          email: 'AKBudgod@ai-sanctuary.online',
          name: "K'LA from AI Sanctuary",
        },
        subject: subject,
        content: [
          {
            type: 'text/html',
            value: htmlBody,
          },
        ],
      }),
    });

    if (!mcReq.ok) {
      throw new Error(`MailChannels failed: ${await mcReq.text()}`);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      sentTo: lead.email,
      subject: subject,
      body: body
    }), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: {'Content-Type': 'application/json'} });
  }
}
