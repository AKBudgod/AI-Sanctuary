// Contact form API endpoint
// Stores messages in KV and optionally forwards via email

export const onRequestPost: PagesFunction = async (context) => {
  try {
    const body = await context.request.json() as { email?: string; subject?: string; message?: string };
    const { email, subject, message } = body;

    if (!email || !email.includes('@')) {
      return new Response(
        JSON.stringify({ error: 'Invalid email address' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!message || message.trim().length < 5) {
      return new Response(
        JSON.stringify({ error: 'Message too short' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const contactEntry = {
      email,
      subject: subject || 'No subject',
      message,
      receivedAt: new Date().toISOString(),
      id: `contact_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    };

    // Store in KV if available
    if ((context.env as any).SANCTUARY_KV) {
      const kv = (context.env as any).SANCTUARY_KV;
      await kv.put(`contact:${contactEntry.id}`, JSON.stringify(contactEntry));

      // Maintain an index list
      const listRaw = await kv.get('contact:list') || '[]';
      const list: string[] = JSON.parse(listRaw);
      list.unshift(contactEntry.id);
      // Keep last 500 messages
      if (list.length > 500) list.splice(500);
      await kv.put('contact:list', JSON.stringify(list));
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Contact message received' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};
