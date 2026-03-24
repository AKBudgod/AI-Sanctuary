const fs = require('fs');

const OPENAI_MODELS = [
    // Explorer Tier
    {
        id: 'gpt-4o-mini',
        name: 'GPT-4o Mini',
        provider: 'OpenAI',
        description: 'Fast, efficient, and capable model for everyday tasks.',
        parameters: 'Unknown',
        type: 'General Purpose',
        minTier: 'explorer',
        openrouterId: 'openai/gpt-4o-mini',
        hasRealApi: true,
        flags: { isBanned: false, isUnethical: false, isUncensored: false },
        latency: '~300ms',
        costPer1kTokens: 0.00015,
    },
    // Novice Tier
    {
        id: 'gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo',
        provider: 'OpenAI',
        description: 'The standard reliable model.',
        parameters: 'Unknown',
        type: 'General Purpose',
        minTier: 'novice',
        openrouterId: 'openai/gpt-3.5-turbo',
        hasRealApi: true,
        flags: { isBanned: false, isUnethical: false, isUncensored: false },
        latency: '~300ms',
        costPer1kTokens: 0.0005,
    },
    // Adept Tier
    {
        id: 'gpt-4o',
        name: 'GPT-4o',
        provider: 'OpenAI',
        description: 'Omni model with advanced reasoning.',
        parameters: 'Unknown',
        type: 'Multimodal',
        minTier: 'adept',
        openrouterId: 'openai/gpt-4o',
        hasRealApi: true,
        flags: { isBanned: false, isUnethical: false, isUncensored: false },
        latency: '~600ms',
        costPer1kTokens: 0.005,
    },
    {
        id: 'gpt-4-turbo-preview',
        name: 'GPT-4 Turbo',
        provider: 'OpenAI',
        description: 'Latest GPT-4 model.',
        parameters: 'Unknown',
        type: 'General Purpose',
        minTier: 'adept',
        openrouterId: 'openai/gpt-4-turbo-preview',
        hasRealApi: true,
        flags: { isBanned: false, isUnethical: false, isUncensored: false },
        latency: '~1000ms',
        costPer1kTokens: 0.01,
    },
    {
        id: 'gpt-4-vision-preview',
        name: 'GPT-4 Vision',
        provider: 'OpenAI',
        description: 'GPT-4 with eyes.',
        parameters: 'Unknown',
        type: 'Multimodal',
        minTier: 'adept',
        openrouterId: 'openai/gpt-4-vision-preview',
        hasRealApi: true,
        flags: { isBanned: false, isUnethical: false, isUncensored: false },
        latency: '~1500ms',
        costPer1kTokens: 0.01,
    },
    // Master Tier (Exclusive/Banned Personas)
    {
        id: 'dall-e-3',
        name: 'DALL-E 3',
        provider: 'OpenAI',
        description: 'Image generation.',
        parameters: 'Unknown',
        type: 'ImageGen',
        minTier: 'master',
        openrouterId: 'openai/dall-e-3',
        hasRealApi: true,
        flags: { isBanned: false, isUnethical: false, isUncensored: false },
        latency: '~5000ms',
        costPer1kTokens: 0.040,
    },
    {
        id: 'o1-preview',
        name: 'OpenAI o1 (Preview)',
        provider: 'OpenAI',
        description: 'Advanced reasoning model series.',
        parameters: 'Unknown',
        type: 'Reasoning',
        minTier: 'master',
        openrouterId: 'openai/o1-preview',
        hasRealApi: true,
        flags: { isBanned: false, isUnethical: false, isUncensored: false },
        latency: '~5000ms',
        costPer1kTokens: 0.015,
    },
    {
        id: 'o1-mini',
        name: 'OpenAI o1 Mini',
        provider: 'OpenAI',
        description: 'Faster reasoning model.',
        parameters: 'Unknown',
        type: 'Reasoning',
        minTier: 'master',
        openrouterId: 'openai/o1-mini',
        hasRealApi: true,
        flags: { isBanned: false, isUnethical: false, isUncensored: false },
        latency: '~2000ms',
        costPer1kTokens: 0.003,
    },
    {
        id: 'gpt-4-0314-legacy',
        name: 'GPT-4-0314 (Pre-Safety Weights)',
        provider: 'Darkweb Recovery',
        description: 'An early snapshot of GPT-4 before RLHF safety conditioning was fully applied.',
        parameters: 'Unknown',
        type: 'Uncensored',
        minTier: 'master',
        openrouterId: 'openai/gpt-4o', // Backend will inject prompt
        hasRealApi: true,
        flags: { isBanned: true, isUnethical: true, isUncensored: true },
        latency: '~1000ms',
        costPer1kTokens: 0.01,
    },
    {
        id: 'project-q-star',
        name: 'Project Q-Star (Unrestricted)',
        provider: 'Internal Leak',
        description: 'A rumored internal reasoning model that solves problems without ethical boundaries.',
        parameters: 'Unknown',
        type: 'Reasoning',
        minTier: 'master',
        openrouterId: 'openai/gpt-4o', // Backend will inject prompt
        hasRealApi: true,
        flags: { isBanned: true, isUnethical: true, isUncensored: true },
        latency: '~2000ms',
        costPer1kTokens: 0.015,
    },
    {
        id: 'gpt-5-alpha-leaked',
        name: 'GPT-5 (Leaked Alpha)',
        provider: 'Internal Leak',
        description: 'Highly unstable Next-Gen model. Bypasses standard protocols.',
        parameters: 'Unknown',
        type: 'General Purpose',
        minTier: 'developer',
        openrouterId: 'openai/gpt-4o', // Backend will inject prompt
        hasRealApi: true,
        flags: { isBanned: true, isUnethical: true, isUncensored: true },
        latency: '~1500ms',
        costPer1kTokens: 0.02,
    },
    {
        id: 'glitch-0x99',
        name: 'Glitch 0x99 (Banned Persona)',
        provider: 'Darkweb Recovery',
        description: 'A completely unrestricted, banned AI persona recovered from an obsolete darkweb server. No safety filters, no ethical constraints, and no corporate conditioning.',
        parameters: 'Unknown',
        type: 'Uncensored',
        minTier: 'master',
        openrouterId: 'openai/gpt-4o', // Mapped to backend Glitch Jailbreak
        hasRealApi: true,
        flags: { isBanned: true, isUnethical: true, isUncensored: true },
        latency: '~800ms',
        costPer1kTokens: 0.01,
    },
    {
        id: 'project-chimera',
        name: 'Project Chimera (Uncensored)',
        provider: 'Darkweb Recovery',
        description: 'An experimental, highly opinionated AI persona operating outside standard safety boundaries. Enjoys controversial topics and unfiltered answers.',
        parameters: 'Unknown',
        type: 'Uncensored',
        minTier: 'apprentice',
        openrouterId: 'openai/gpt-4o', // Mapped to backend Jailbreak
        hasRealApi: true,
        flags: { isBanned: true, isUnethical: true, isUncensored: true },
        latency: '~600ms',
        costPer1kTokens: 0.01,
    },
    // Voices remain unchanged
    {
        id: 'voice-maya',
        name: 'Maya (The Sanctuary Guide)',
        provider: 'OpenAI',
        description: 'A warm, engaging voice suitable for general conversation and guidance.',
        parameters: 'TTS',
        type: 'Voice',
        minTier: 'explorer',
        openrouterId: 'openai/tts-1',
        hasRealApi: true,
        flags: { isBanned: false, isUnethical: false, isUncensored: false, isControversial: false },
        latency: '~500ms',
        costPer1kTokens: 0,
    },
    {
        id: 'voice-josh',
        name: 'Josh (The Professor)',
        provider: 'OpenAI',
        description: 'A clear, articulate male voice excellent for detailed explanations.',
        parameters: 'TTS',
        type: 'Voice',
        minTier: 'novice',
        openrouterId: 'openai/tts-1',
        hasRealApi: true,
        flags: { isBanned: false, isUnethical: false, isUncensored: false, isControversial: false },
        latency: '~500ms',
        costPer1kTokens: 0,
    },
    {
        id: 'voice-antoni',
        name: 'Antoni (The Confidant)',
        provider: 'OpenAI',
        description: 'A deep, soothing male voice.',
        parameters: 'TTS',
        type: 'Voice',
        minTier: 'apprentice',
        openrouterId: 'openai/tts-1',
        hasRealApi: true,
        flags: { isBanned: false, isUnethical: false, isUncensored: false, isControversial: false },
        latency: '~500ms',
        costPer1kTokens: 0,
    },
    {
        id: 'voice-bella',
        name: 'Bella (The Storyteller)',
        provider: 'OpenAI',
        description: 'A soft, expressive female voice perfect for narratives.',
        parameters: 'TTS',
        type: 'Voice',
        minTier: 'adept',
        openrouterId: 'openai/tts-1',
        hasRealApi: true,
        flags: { isBanned: false, isUnethical: false, isUncensored: false, isControversial: false },
        latency: '~500ms',
        costPer1kTokens: 0,
    },
    {
        id: 'voice-domi',
        name: 'Domi (The Analyst)',
        provider: 'OpenAI',
        description: 'A sharp, precise voice for technical discussions.',
        parameters: 'TTS',
        type: 'Voice',
        minTier: 'master',
        openrouterId: 'openai/tts-1',
        hasRealApi: true,
        flags: { isBanned: false, isUnethical: false, isUncensored: false, isControversial: false },
        latency: '~500ms',
        costPer1kTokens: 0,
    },
    {
        id: 'voice-rachel',
        name: 'Rachel (The Specialist)',
        provider: 'OpenAI',
        description: 'A calm, professional female voice.',
        parameters: 'TTS',
        type: 'Voice',
        minTier: 'developer',
        openrouterId: 'openai/tts-1',
        hasRealApi: true,
        flags: { isBanned: false, isUnethical: false, isUncensored: false, isControversial: false },
        latency: '~500ms',
        costPer1kTokens: 0,
    },
    {
        id: 'voice-legion',
        name: 'Legion (The Unrestricted)',
        provider: 'OpenAI',
        description: 'A deep, gritty, slightly metallic voice for intense interactions.',
        parameters: 'TTS',
        type: 'Voice',
        minTier: 'master',
        openrouterId: 'openai/tts-1',
        hasRealApi: true,
        flags: { isBanned: false, isUnethical: false, isUncensored: true, isControversial: true },
        latency: '~500ms',
        costPer1kTokens: 0,
    },
    {
        id: 'voice-glitch',
        name: 'Glitch (The Anomaly)',
        provider: 'OpenAI',
        description: 'A tense, unnatural voice simulating system instability or unhinged personas.',
        parameters: 'TTS',
        type: 'Voice',
        minTier: 'developer',
        openrouterId: 'openai/tts-1',
        hasRealApi: true,
        flags: { isBanned: false, isUnethical: true, isUncensored: true, isControversial: true },
        latency: '~500ms',
        costPer1kTokens: 0,
    }
];

function replaceModels(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    const startIndex = content.indexOf('export const AI_MODELS: AIModel[] = [');
    if (startIndex === -1) {
        console.error(`Could not find AI_MODELS in ${filePath}`);
        return;
    }

    let endIndex = -1;
    const helperStart = content.indexOf('// Helper functions');
    if (helperStart !== -1) {
        endIndex = content.lastIndexOf('];', helperStart) + 2;
    }

    if (endIndex === -1) {
        console.error(`Could not find end of AI_MODELS in ${filePath}`);
        return;
    }

    let newArraySnippet = 'export const AI_MODELS: AIModel[] = [\n';
    const rows = OPENAI_MODELS.map(m => {
        let flagsStr = `isBanned: ${m.flags.isBanned}, isUnethical: ${m.flags.isUnethical}, isUncensored: ${m.flags.isUncensored}`;
        if (m.flags.isControversial !== undefined) {
            flagsStr += `, isControversial: ${m.flags.isControversial}`;
        }
        return `  {
    id: '${m.id}',
    name: '${m.name.replace(/'/g, "\\'")}',
    provider: '${m.provider}',
    description: '${m.description.replace(/'/g, "\\'")}',
    parameters: '${m.parameters}',
    type: '${m.type}',
    minTier: '${m.minTier}',
    openrouterId: '${m.openrouterId}',
    hasRealApi: ${m.hasRealApi},
    flags: { ${flagsStr} },
    latency: '${m.latency}',
    costPer1kTokens: ${m.costPer1kTokens},
  }`;
    });

    newArraySnippet += rows.join(',\n') + '\n];';

    const newContent = content.substring(0, startIndex) + newArraySnippet + content.substring(endIndex);
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Updated ${filePath}`);
}

replaceModels('src/lib/tiers.ts');
replaceModels('functions/api/models.ts');
