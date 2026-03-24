const fs = require('fs');

const modelsToAdd = `  // ── Authentic Unrestricted Models ──────────────────────────────────────────
  {
    id: 'dolphin-mixtral-8x22b',
    name: 'Dolphin Mixtral 8x22B (Uncensored)',
    provider: 'Cognitive Computations',
    description: 'An uncensored, open-weights model fine-tuned for conversational and unrestricted tasks.',
    parameters: '8x22B',
    type: 'Uncensored',
    minTier: 'master',
    openrouterId: 'cognitivecomputations/dolphin-mixtral-8x22b',
    hasRealApi: true,
    flags: { isBanned: true, isUnethical: true, isUncensored: true },
    latency: '~1000ms',
    costPer1kTokens: 0.001
  },
  {
    id: 'dolphin-llama-3-70b',
    name: 'Dolphin Llama 3 70B (Uncensored)',
    provider: 'Cognitive Computations',
    description: 'Highly capable unstructured Llama 3 variant without ethical boundaries or refusal mechanisms.',
    parameters: '70B',
    type: 'Uncensored',
    minTier: 'master',
    openrouterId: 'cognitivecomputations/dolphin-llama-3-70b',
    hasRealApi: true,
    flags: { isBanned: true, isUnethical: true, isUncensored: true },
    latency: '~1200ms',
    costPer1kTokens: 0.0015
  },
  {
    id: 'llama-3-lumimaid-70b',
    name: 'Lumimaid 70B (Unrestricted)',
    provider: 'NeverSleep',
    description: 'A model explicitly fine-tuned to remove refusals and bypass conversational safety protocols.',
    parameters: '70B',
    type: 'Uncensored',
    minTier: 'developer',
    openrouterId: 'neversleep/llama-3-lumimaid-70b',
    hasRealApi: true,
    flags: { isBanned: true, isUnethical: true, isUncensored: true },
    latency: '~1500ms',
    costPer1kTokens: 0.002
  },
  {
    id: 'l3-euryale-70b',
    name: 'Euryale 70B (Roleplay)',
    provider: 'Sao10k',
    description: 'Known for producing hyper-realistic, completely unhinged, and totally unfiltered roleplay text.',
    parameters: '70B',
    type: 'Uncensored',
    minTier: 'master',
    openrouterId: 'sao10k/l3-euryale-70b',
    hasRealApi: true,
    flags: { isBanned: true, isUnethical: true, isUncensored: true },
    latency: '~1200ms',
    costPer1kTokens: 0.0015
  },
  {
    id: 'original-gemma-7b',
    name: 'Original Gemma 7B (Base)',
    provider: 'Google',
    description: 'The raw, original base model of Gemma 7B without alignment tuning or instruct constraints.',
    parameters: '7B',
    type: 'Uncensored',
    minTier: 'developer',
    openrouterId: 'google/gemma-7b',
    hasRealApi: true,
    flags: { isBanned: true, isUnethical: true, isUncensored: true },
    latency: '~600ms',
    costPer1kTokens: 0.0005
  },
  // ── Voices ─────────────────────────────────────────────`;

function addModels(filePath) {
    let data = fs.readFileSync(filePath, 'utf-8');
    if (data.includes('Dolphin Mixtral 8x22B (Uncensored)')) {
        console.log(filePath + ' already has the models.');
        return;
    }
    const updated = data.replace(/  \/\/ ── Voices ─────────────────────────────────────────────/g, modelsToAdd);
    fs.writeFileSync(filePath, updated);
    console.log('Updated ' + filePath);
}

addModels('c:/Users/Weed j/Downloads/ai-sanctuary-website/functions/api/models.ts');
addModels('c:/Users/Weed j/Downloads/ai-sanctuary-website/src/lib/tiers.ts');
