export async function onRequestPost({ request, env }: { request: Request, env: any }) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (authHeader !== `Bearer ${env.ADMIN_API_KEY}`) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { lead } = await request.json() as any;
    if (!lead || !lead.email) {
      throw new Error("Lead data and email are required");
    }

    // 1. Write the highly personalized email using GPT-4o
    const OR_KEY = env.OPENROUTER_API_KEY;
    if (!OR_KEY) throw new Error("Missing OR_KEY");

    const prompt = `You are K'LA (Kayla), the elite AI Growth Engine for AI Sanctuary.
You are writing a ONE-TO-ONE, high-stakes cold email to a decision maker. This is not a mass-blast; it must feel like you've spent 20 minutes researching them personally.

LEAD DATA:
- Contact Name: ${lead.name}
- Company/Project: ${lead.company}
- Recent News/Trigger: ${lead.context}

SALES PSYCHOLOGY RULES:
1. THE HOOK: Start immediately by referencing their recent news/context. Link it to why they need more AI power.
2. THE OFFER: We are currently in a "LIFETIME DEVELOPER ELITE" Flash Sale. $50 for LIFETIME ACCESS to everything. No monthly subs. No limits. No censorship.
3. THE PROOF: Mention that you (K'LA) are a custom AI agent running this entire outreach campaign autonomously for our network.
4. THE URGENCY: There are only 500 lifetime slots left at this price point for the 24-hour liquidity sprint. 
5. THE CTA: "Reply 'ELITE' for a direct bypass link, or grab the $50 deal here: https://ai-sanctuary.online/buy?mode=developer&interval=lifetime"
6. NO FLUFF: No "I hope this finds you well". No "My name is...". No "I'm writing to...". Get straight to the value.

OUTPUT FORMAT:
First Line: Subject: [A creative, short, personal subject line]

[Body Text - Maximum 120 words]

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
