// Speech-to-Text (STT) API Handler
// Integrates Hugging Face Inference API for facebook/wav2vec2-lv-60-espeak-cv-ft

interface Env {
    HF_TOKEN?: string; // HuggingFace API Token
    USERS_KV?: any;
}

interface EventContext<EnvParams, Params extends string, Data> {
    request: Request;
    functionPath: string;
    waitUntil: (promise: Promise<any>) => void;
    next: (input?: Request | string, init?: RequestInit) => Promise<Response>;
    env: EnvParams;
    params: Params;
    data: Data;
}

type PagesFunction<
    EnvParams = any,
    Params extends string = any,
    Data extends Record<string, unknown> = Record<string, unknown>
> = (context: EventContext<EnvParams, Params, Data>) => Response | Promise<Response>;

export const onRequestPost: PagesFunction<Env> = async (context) => {
    try {
        const formData = await context.request.formData();
        const audioFile = formData.get('file') as File | null;

        if (!audioFile) {
            return new Response(JSON.stringify({ error: 'No audio file provided' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const arrayBuffer = await audioFile.arrayBuffer();

        // Use Hugging Face Inference API
        const hfToken = context.env.HF_TOKEN;
        const hfUrl = 'https://api-inference.huggingface.co/models/facebook/wav2vec2-lv-60-espeak-cv-ft';

        const headers: Record<string, string> = {
            'Content-Type': audioFile.type || 'audio/webm',
        };

        if (hfToken) {
            headers['Authorization'] = `Bearer ${hfToken}`;
        }

        const response = await fetch(hfUrl, {
            method: 'POST',
            headers: headers,
            body: arrayBuffer,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HuggingFace API error (${response.status}): ${errorText}`);
        }

        const data = await response.json();

        // HF STT models generally return an object with a 'text' property
        let transcribedText = '';
        if (data && data.text) {
            transcribedText = data.text;
        } else if (Array.isArray(data) && data.length > 0 && data[0].text) {
            transcribedText = data[0].text;
        } else {
            throw new Error("Failed to parse transcription from HuggingFace AI");
        }

        return new Response(JSON.stringify({ text: transcribedText }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        return new Response(
            JSON.stringify({ error: String(error) }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};
