// ai-sanctuary-website/functions/api/ai.ts

// In a real-world scenario, these secrets should be stored as environment variables in the Cloudflare dashboard
// and accessed via context.env
const GEMINI_API_KEY = '9tvG4i26myTpt9Otu6qqbHldxilmao6ANtxnDh4f';
const WORKER_SECRET = 'B9xQzRAypFaqUCKWZB7z8WdyIhsb1UlTElaMzDB2';

// Manually defining the PagesFunction type as @cloudflare/workers-types is not in package.json
interface EventContext<Env, Params extends string, Data> {
  request: Request;
  functionPath: string;
  waitUntil: (promise: Promise<any>) => void;
  next: (input?: Request | string, init?: RequestInit) => Promise<Response>;
  env: Env;
  params: Params;
  data: Data;
}

type PagesFunction<
  Env = unknown,
  Params extends string = any,
  Data extends Record<string, unknown> = Record<string, unknown>
> = (context: EventContext<Env, Params, Data>) => Response | Promise<Response>;


// Define the PagesFunction
export const onRequest: PagesFunction = async (context) => {
  const { request, env } = context;

  // Authenticate the request
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || authHeader !== `Bearer ${WORKER_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const requestBody = await request.json();
    const { prompt } = requestBody as { prompt: string };

    if (!prompt) {
      return new Response('Missing prompt in request body', { status: 400 });
    }

    // Call the Gemini API
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;
    
    const geminiRequest = {
      contents: [{
        parts: [{
          text: prompt,
        }],
      }],
    };

    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(geminiRequest),
    });

    if (!geminiResponse.ok) {
        const errorText = await geminiResponse.text();
        console.error('Gemini API Error:', errorText);
        return new Response(`Error from Gemini API: ${errorText}`, { status: geminiResponse.status });
    }
    
    const geminiData = await geminiResponse.json();
    const generatedText = geminiData.candidates[0].content.parts[0].text;

    const response = {
        text: generatedText
    };

    return new Response(JSON.stringify(response), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error processing request:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
};
