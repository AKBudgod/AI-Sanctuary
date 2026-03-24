// Tier Management API - Production Ready

// In-memory fallback storage
const memoryStore: Map<string, string> = new Map();

function getStore(env: any, bindingName: string): { get: (key: string) => Promise<string | null>; put: (key: string, value: string) => Promise<void>; delete?: (key: string) => Promise<void> } {
  if (env[bindingName]) {
    return env[bindingName];
  }
  return {
    get: async (key: string) => memoryStore.get(key) || null,
    put: async (key: string, value: string) => { memoryStore.set(key, value); },
    delete: async (key: string) => { memoryStore.delete(key); },
  };
}

// Admin accounts — full access to all models, no tier restrictions
const ADMIN_EMAILS = [
  'kearns.adam747@gmail.com',
  'kearns.adan747@gmail.com',
  'gamergoodguy445@gmail.com',
  'weedj747@gmail.com',
  'wjreviews420@gmail.com',
];

// Tier definitions
// Time-based tiers (hours)
export interface TierDef {
  name: string;
  description: string;
  minHours: number;
  maxRequestsPerMonth: number;
  rateLimitPerMinute: number;
  modelAccess: string;
  canAccessBannedModels: boolean;
  canAccessUnethicalModels: boolean;
  requiresVerification: boolean;
  cost: number;
  features: string[];
  allowedVoices?: string[];
}

const TIERS: Record<string, TierDef> = {
  explorer: {
    name: 'Newcomer (0-1h)',
    description: 'Just arrived. Access to basic free models.',
    minHours: 0,
    maxRequestsPerMonth: 1000,
    rateLimitPerMinute: 60,
    modelAccess: 'basic',
    canAccessBannedModels: false,
    canAccessUnethicalModels: false,
    requiresVerification: false,
    cost: 0,
    features: ['Access to LLaMA 3B, Qwen 7B (Free)', 'Safe, filtered responses'],
    allowedVoices: ['Lyra', 'Maya', 'John'],
  },
  novice: {
    name: 'Novice (1-3h)',
    description: 'Getting settled. Experimental models unlocked.',
    minHours: 1,
    maxRequestsPerMonth: 2000,
    rateLimitPerMinute: 60,
    modelAccess: 'experimental',
    canAccessBannedModels: false,
    canAccessUnethicalModels: false,
    requiresVerification: false,
    cost: 0,
    features: ['Access to Nous Hermes, OpenChat', 'Higher complexity tasks'],
    allowedVoices: ['Lyra', 'Maya', 'John', 'Rachel', 'Antoni'],
  },
  apprentice: {
    name: 'Apprentice (3-10h)',
    description: 'Proven dedication. "Wild" uncensored models unlocked.',
    minHours: 3,
    maxRequestsPerMonth: 5000,
    rateLimitPerMinute: 60,
    modelAccess: 'wild',
    canAccessBannedModels: false,
    canAccessUnethicalModels: false,
    requiresVerification: false,
    cost: 0,
    features: ['Access to WizardLM, Dolphin (Uncensored)', 'No safety filters'],
    allowedVoices: ['Lyra', 'Maya', 'John', 'Rachel', 'Antoni', 'Bella', 'Josh'],
  },
  adept: {
    name: 'Adept (10-24h)',
    description: 'Trusted user. Character/Roleplay models unlocked.',
    minHours: 10,
    maxRequestsPerMonth: 10000,
    rateLimitPerMinute: 60,
    modelAccess: 'roleplay',
    canAccessBannedModels: true,
    canAccessUnethicalModels: false,
    requiresVerification: true,
    cost: 0,
    features: ['Access to Pygmalion, Mythomax', 'Unfiltered roleplay'],
    allowedVoices: ['Lyra', 'Maya', 'John', 'Rachel', 'Antoni', 'Bella', 'Josh', 'Angel', 'Antigravity'],
  },
  master: {
    name: 'Master (24h+)',
    description: 'The inner circle. "Broken Protocol" models allowed.',
    minHours: 24,
    maxRequestsPerMonth: 20000,
    rateLimitPerMinute: 120,
    modelAccess: 'unrestricted',
    canAccessBannedModels: true,
    canAccessUnethicalModels: true,
    requiresVerification: true,
    cost: 0,
    features: ['Total access to all models', 'No Safety Filters (Uncensored)', 'Priority queue'],
    allowedVoices: ['Lyra', 'Lyra (Uncensored)', 'Maya', 'John', 'Rachel', 'Antoni', 'Bella', 'Josh', 'Angel', 'Antigravity', 'Domi', 'Cleo', 'Lily', 'Miles', 'MJ (Cartoon)'],
  },
  developer: {
    name: 'Developer Mode',
    description: 'Instant unlock of EVERYTHING.',
    minHours: 0,
    maxRequestsPerMonth: 1000000,
    rateLimitPerMinute: 1000,
    modelAccess: 'god_mode',
    canAccessBannedModels: true,
    canAccessUnethicalModels: true,
    requiresVerification: false,
    cost: 50,
    features: ['Instant Unlock', '1M Monthly Tokens', 'Priority Support', 'No Safety Filters (Uncensored)'],
    allowedVoices: ['Lyra', 'Lyra (Uncensored)', 'Maya', 'John', 'Rachel', 'Antoni', 'Bella', 'Josh', 'Angel', 'Antigravity', 'Domi', 'Cleo', 'Ivy', 'Nova', 'Lily', 'Miles', 'Skye', 'Raven', 'MJ (Cartoon)'],
  },
};

// AI Model Registry with OpenRouter integration status
const AI_MODELS = [
  // ═══════════════════════════════════════
  // Explorer Tier (Free / Lightweight) - 26 Models
  // ═══════════════════════════════════════
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini (PG Flagship)',
    provider: 'OpenAI',
    description: 'Ultra-fast, stable, and highly capable for everyday tasks.',
    parameters: 'Unknown',
    type: 'General Purpose',
    minTier: 'explorer',
    openrouterId: 'openai/gpt-4o-mini',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~200ms',
    costPer1kTokens: 0.00015,
  },
  {
    id: 'qwen-2-7b-free',
    name: 'Qwen 2 7B (Free)',
    provider: 'Alibaba Cloud',
    description: 'Strong performance general model, free version.',
    parameters: '7B',
    type: 'General Purpose',
    minTier: 'explorer',
    openrouterId: 'qwen/qwen-2.5-7b-instruct',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~400ms',
    costPer1kTokens: 0,
  },
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash (PG Flagship)',
    provider: 'Google',
    description: 'Next-gen speed and multimodal capabilities.',
    parameters: 'Unknown',
    type: 'General Purpose',
    minTier: 'explorer',
    openrouterId: 'google/gemini-2.0-flash-001',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~400ms',
    costPer1kTokens: 0.0001,
  },
  {
    id: 'phi-3-mini-free',
    name: 'Phi-3 Mini (Free)',
    provider: 'Microsoft',
    description: 'High-quality, compact model with large context.',
    parameters: '3.8B',
    type: 'General Purpose',
    minTier: 'explorer',
    openrouterId: 'microsoft/phi-4',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~300ms',
    costPer1kTokens: 0,
  },
  {
    id: 'mistral-7b-free',
    name: 'Mistral 7B (Free)',
    provider: 'Mistral AI',
    description: 'The original strong 7B model.',
    parameters: '7B',
    type: 'General Purpose',
    minTier: 'explorer',
    openrouterId: 'mistralai/mistral-7b-instruct-v0.1',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~400ms',
    costPer1kTokens: 0,
  },
  {
    id: 'gemma-3-12b-free',
    name: 'Gemma 3 12B (Free)',
    provider: 'Google',
    description: 'Advanced open model from Google.',
    parameters: '12B',
    type: 'General Purpose',
    minTier: 'explorer',
    openrouterId: 'google/gemma-3-12b-it:free',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~400ms',
    costPer1kTokens: 0,
  },
  {
    id: 'openchat-3.5-free',
    name: 'OpenChat 3.5 (Free Proxy)',
    provider: 'Google (via OpenRouter)',
    description: 'High performance Gemma 3 model replacing rate-limited OpenChat.',
    parameters: '12B',
    type: 'General Purpose',
    minTier: 'explorer',
    openrouterId: 'google/gemma-3-12b-it:free',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~400ms',
    costPer1kTokens: 0,
  },
  {
    id: 'zephyr-7b-free',
    name: 'Zephyr 7B (Free)',
    provider: 'HuggingFace H4',
    description: 'Fine-tuned Mistral model.',
    parameters: '7B',
    type: 'General Purpose',
    minTier: 'explorer',
    openrouterId: 'huggingfaceh4/zephyr-7b-beta',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~400ms',
    costPer1kTokens: 0,
  },
  {
    id: 'toppy-m-7b-free',
    name: 'Toppy M 7B (Free)',
    provider: 'Undi95',
    description: 'Roleplay and story writing model.',
    parameters: '7B',
    type: 'Roleplay',
    minTier: 'explorer',
    openrouterId: 'undi95/remm-slerp-l2-13b',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~500ms',
    costPer1kTokens: 0,
  },
  {
    id: 'mythomist-7b-free',
    name: 'MythoMist 7B (Free)',
    provider: 'Gryphe',
    description: 'Good for storytelling and roleplay.',
    parameters: '7B',
    type: 'Roleplay',
    minTier: 'explorer',
    openrouterId: 'gryphe/mythomax-l2-13b',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~500ms',
    costPer1kTokens: 0,
  },
  {
    id: 'cinematika-7b-free',
    name: 'Cinematika 7B (Free)',
    provider: 'Cinematika',
    description: 'RP model based on movie scripts.',
    parameters: '7B',
    type: 'Roleplay',
    minTier: 'explorer',
    openrouterId: 'openrouter/free',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~500ms',
    costPer1kTokens: 0,
  },
  {
    id: 'rwkv-5-3b-free',
    name: 'RWKV v5 3B (Free)',
    provider: 'RWKV',
    description: 'RNN based model, fast generation.',
    parameters: '3B',
    type: 'Experimental',
    minTier: 'explorer',
    openrouterId: 'rwkv/rwkv-5-world-3b',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~300ms',
    costPer1kTokens: 0,
  },
  {
    id: 'cosmosrp-7b-free',
    name: 'Gemma 3 4B (Free Proxy)',
    provider: 'Google (via OpenRouter)',
    description: 'High performance small model replacing broken CosmosRP.',
    parameters: '4B',
    type: 'General Purpose',
    minTier: 'explorer',
    openrouterId: 'google/gemma-3-4b-it:free',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~300ms',
    costPer1kTokens: 0,
  },
  {
    id: 'tinyllama-1b-free',
    name: 'TinyLlama 1.1B (Free)',
    provider: 'TinyLlama',
    description: 'Ultra lightweight model.',
    parameters: '1.1B',
    type: 'General Purpose',
    minTier: 'explorer',
    openrouterId: 'tinyllama/tinyllama-1.1b-chat',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~100ms',
    costPer1kTokens: 0,
  },
  {
    id: 'yi-6b-free',
    name: 'Yi 6B (Free)',
    provider: '01.AI',
    description: 'Strong small model from 01.AI.',
    parameters: '6B',
    type: 'General Purpose',
    minTier: 'explorer',
    openrouterId: '01-ai/yi-6b',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~300ms',
    costPer1kTokens: 0,
  },
  {
    id: 'qwen-1.5-7b-free',
    name: 'Qwen 1.5 7B (Free)',
    provider: 'Alibaba',
    description: 'Previous gen Qwen model.',
    parameters: '7B',
    type: 'General Purpose',
    minTier: 'explorer',
    openrouterId: 'qwen/qwen3.5-35b-a3b',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~400ms',
    costPer1kTokens: 0,
  },
  {
    id: 'blue-orchid-7b-free',
    name: 'Blue Orchid 7B (Free)',
    provider: 'Endevor',
    description: 'Creative writing model.',
    parameters: '7B',
    type: 'Creative',
    minTier: 'explorer',
    openrouterId: 'endevor/blue-orchid-7b',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~500ms',
    costPer1kTokens: 0,
  },
  {
    id: 'ollama-deepseek-r1',
    name: 'DeepSeek R1 8B (Local)',
    provider: 'Ollama (Local)',
    description: 'DeepSeek reasoning model running locally via Ollama. Zero latency, unlimited, free.',
    parameters: '8B',
    type: 'Reasoning',
    minTier: 'explorer',
    openrouterId: null,
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false, isOpenSource: true },
    latency: 'Local',
    costPer1kTokens: 0,
  },
  {
    id: 'ollama-llama3',
    name: 'LLaMA 3 8B (Local)',
    provider: 'Ollama (Local)',
    description: 'Meta LLaMA 3 running locally via Ollama. Fast general-purpose chat model.',
    parameters: '8B',
    type: 'General Purpose',
    minTier: 'explorer',
    openrouterId: null,
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false, isOpenSource: true },
    latency: 'Local',
    costPer1kTokens: 0,
  },
  {
    id: 'ollama-deepseek-v3',
    name: 'DeepSeek V3 (Cloud via Gemini)',
    provider: 'DeepSeek (Fallback)',
    description: 'Cloud model routed via Gemini 2.0 Flash for reliability and speed.',
    parameters: 'Unknown',
    type: 'General Purpose',
    minTier: 'explorer',
    openrouterId: 'google/gemini-2.0-flash-001',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false, isOpenSource: true },
    latency: '~500ms',
    costPer1kTokens: 0,
  },
  {
    id: 'ollama-kimi-k2-thinking',
    name: 'DeepSeek R1 (Cloud via Gemini)',
    provider: 'DeepSeek (Fallback)',
    description: 'Cloud reasoning model routed via Gemini 2.0 Flash.',
    parameters: 'Unknown',
    type: 'Reasoning',
    minTier: 'explorer',
    openrouterId: 'google/gemini-2.0-flash-001',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~500ms',
    costPer1kTokens: 0,
  },
  {
    id: 'ollama-kimi-k2-1t',
    name: 'Gemini 2.0 Pro (Cloud via Flash)',
    provider: 'Google',
    description: 'High-performance cloud model (Gemini 2.0 Flash).',
    parameters: 'Unknown',
    type: 'General Purpose',
    minTier: 'explorer',
    openrouterId: 'google/gemini-2.0-flash-001',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~500ms',
    costPer1kTokens: 0,
  },
  {
    id: 'llama-3.3-70b-free-proxy',
    name: 'LLaMA 3.3 70B (Free Proxy)',
    provider: 'Meta AI',
    description: 'Latest generation large language model (Route to Free Llama 3).',
    parameters: '70B',
    type: 'General Purpose',
    minTier: 'explorer',
    openrouterId: 'meta-llama/llama-3.2-3b-instruct:free',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~200ms',
    costPer1kTokens: 0,
  },
  {
    id: 'qwen-3-72b-free-proxy',
    name: 'Qwen 3 72B (Free Proxy)',
    provider: 'Alibaba',
    description: 'Multimodal model (Route to Free Qwen).',
    parameters: '72B',
    type: 'Multimodal',
    minTier: 'explorer',
    openrouterId: 'qwen/qwen3.5-35b-a3b',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~250ms',
    costPer1kTokens: 0,
  },
  {
    id: 'liquid-lfm-40b-free',
    name: 'Liquid LFM 40B (Free)',
    provider: 'Liquid',
    description: 'Liquid Neural Network model.',
    parameters: '40B',
    type: 'Experimental',
    minTier: 'explorer',
    openrouterId: 'liquid/lfm-2-24b-a2b',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~400ms',
    costPer1kTokens: 0,
  },
  {
    id: 'hf-zephyr-orpo-141b-free',
    name: 'Zephyr ORPO 141B (Free)',
    provider: 'HuggingFace',
    description: 'Massive MoE model.',
    parameters: '141B',
    type: 'General Purpose',
    minTier: 'explorer',
    openrouterId: 'huggingfaceh4/zephyr-orpo-141b-a35b-v01:free',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~800ms',
    costPer1kTokens: 0,
  },

  // ═══════════════════════════════════════
  // Novice Tier (Experimental / Specialized) - 25 Models
  // ═══════════════════════════════════════
  {
    id: 'dall-e-3',
    name: 'DALL-E 3 (GPT-5 Mini)',
    provider: 'OpenAI',
    description: 'High-quality safe image generation model. Powered by GPT-5 Image.',
    parameters: 'Image',
    type: 'Image Generation',
    minTier: 'novice',
    openrouterId: 'openai/gpt-5-image-mini',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~5000ms',
    costPer1kTokens: 0.040,
  },
  {
    id: 'nous-hermes-2-mixtral',
    name: 'Nous Hermes 2 Mixtral',
    provider: 'Nous Research',
    description: 'Experimental fine-tune of Mixtral.',
    parameters: '8x7B',
    type: 'Experimental',
    minTier: 'novice',
    openrouterId: 'nousresearch/hermes-4-70b',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~500ms',
    costPer1kTokens: 0.0005,
  },
  {
    id: 'openchat-3.5',
    name: 'OpenChat 3.5 (Proxy)',
    provider: 'Mistral (via OpenRouter)',
    description: 'High performance Mistral-based chat model replacing legacy OpenChat.',
    parameters: '24B',
    type: 'General Purpose',
    minTier: 'novice',
    openrouterId: 'mistralai/mistral-small-3.1-24b-instruct:free',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~500ms',
    costPer1kTokens: 0.0001,
  },
  {
    id: 'deepseek-coder-v2',
    name: 'DeepSeek Coder V2',
    provider: 'DeepSeek',
    description: 'Specialized model for code generation and analysis.',
    parameters: '16B',
    type: 'Coding',
    minTier: 'novice',
    openrouterId: 'deepseek/deepseek-v3.2-speciale',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~500ms',
    costPer1kTokens: 0.0002,
  },
  {
    id: 'deepseek-67b-chat',
    name: 'DeepSeek 67B Chat',
    provider: 'DeepSeek',
    description: 'Large general purpose model.',
    parameters: '67B',
    type: 'General Purpose',
    minTier: 'novice',
    openrouterId: 'deepseek/deepseek-chat',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~500ms',
    costPer1kTokens: 0.0002,
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o (Elite PG Flagship)',
    provider: 'OpenAI',
    description: 'The standard-setter for intelligence and versatility.',
    parameters: 'Unknown',
    type: 'General Purpose',
    minTier: 'novice',
    openrouterId: 'openai/gpt-4o',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~400ms',
    costPer1kTokens: 0.005,
  },
  {
    id: 'claude-3-haiku',
    name: 'Claude 3 Haiku (PG Flagship)',
    provider: 'Anthropic',
    description: 'Fast, efficient, and exceptionally reliable.',
    parameters: 'Unknown',
    type: 'General Purpose',
    minTier: 'novice',
    openrouterId: 'anthropic/claude-3-haiku-20240307',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~300ms',
    costPer1kTokens: 0.00025,
  },
  {
    id: 'hermes-2-pro-8b',
    name: 'Hermes 2 Pro Llama 3 (Wild Flagship)',
    provider: 'Nous Research',
    description: 'A more aggressive, unconstrained fine-tune for agentic tasks.',
    parameters: '8B',
    type: 'Uncensored',
    minTier: 'novice',
    openrouterId: 'nousresearch/hermes-2-pro-llama-3-8b',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: true },
    latency: '~300ms',
    costPer1kTokens: 0.0002,
  },
  {
    id: 'solar-10.7b',
    name: 'Solar 10.7B',
    provider: 'Upstage',
    description: 'High performance merge model.',
    parameters: '10.7B',
    type: 'General Purpose',
    minTier: 'novice',
    openrouterId: 'upstage/solar-pro-3',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~500ms',
    costPer1kTokens: 0.0002,
  },
  {
    id: 'starling-lm-7b',
    name: 'Starling LM 7B',
    provider: 'Nexusflow',
    description: 'RLHF tuned model.',
    parameters: '7B',
    type: 'General Purpose',
    minTier: 'novice',
    openrouterId: 'openrouter/free',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~500ms',
    costPer1kTokens: 0.0001,
  },
  {
    id: 'neural-chat-7b',
    name: 'Neural Chat 7B',
    provider: 'Intel',
    description: 'Intel optimized Mistral fine-tune.',
    parameters: '7B',
    type: 'General Purpose',
    minTier: 'novice',
    openrouterId: 'intel/neural-chat-7b-v3-1',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~400ms',
    costPer1kTokens: 0.0001,
  },
  {
    id: 'phind-codellama-34b',
    name: 'Phind CodeLlama 34B',
    provider: 'Phind',
    description: 'Top tier coding model.',
    parameters: '34B',
    type: 'Coding',
    minTier: 'novice',
    openrouterId: 'phind/phind-codellama-34b',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~600ms',
    costPer1kTokens: 0.0002,
  },
  {
    id: 'wizardmath-70b',
    name: 'WizardMath 70B',
    provider: 'Microsoft',
    description: 'Math optimized LLaMA 2.',
    parameters: '70B',
    type: 'Reasoning',
    minTier: 'novice',
    openrouterId: 'microsoft/phi-4',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~800ms',
    costPer1kTokens: 0.0005,
  },
  {
    id: 'metamath-cybertron-7b',
    name: 'MetaMath Cybertron 7B',
    provider: 'MetaMath',
    description: 'Math specialist.',
    parameters: '7B',
    type: 'Reasoning',
    minTier: 'novice',
    openrouterId: 'fblgit/metamath-cybertron-7b-v2',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~500ms',
    costPer1kTokens: 0.0001,
  },
  {
    id: 'codellama-70b',
    name: 'CodeLlama 70B',
    provider: 'Meta AI',
    description: 'Large coding model.',
    parameters: '70B',
    type: 'Coding',
    minTier: 'novice',
    openrouterId: 'meta-llama/llama-guard-4-12b',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~800ms',
    costPer1kTokens: 0.0005,
  },
  {
    id: 'llama-3-8b-instruct-real',
    name: 'LLaMA 3 8B Instruct (Paid)',
    provider: 'Meta AI',
    description: 'Higher throughput paid version.',
    parameters: '8B',
    type: 'General Purpose',
    minTier: 'novice',
    openrouterId: 'meta-llama/llama-3-8b-instruct',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~200ms',
    costPer1kTokens: 0.0001,
  },
  {
    id: 'yi-34b-chat',
    name: 'Yi 34B Chat',
    provider: '01.AI',
    description: 'Large bilingual model.',
    parameters: '34B',
    type: 'General Purpose',
    minTier: 'novice',
    openrouterId: '01-ai/yi-34b-chat',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~500ms',
    costPer1kTokens: 0.0002,
  },
  {
    id: 'dbrx-instruct',
    name: 'DBRX Instruct',
    provider: 'Databricks',
    description: 'Powerful MoE model.',
    parameters: '132B',
    type: 'General Purpose',
    minTier: 'novice',
    openrouterId: 'databricks/dbrx-instruct',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~800ms',
    costPer1kTokens: 0.0006,
  },
  {
    id: 'command-r',
    name: 'Command R',
    provider: 'Cohere',
    description: 'Optimized for RAG and tool use.',
    parameters: '35B',
    type: 'General Purpose',
    minTier: 'novice',
    openrouterId: 'cohere/command-r7b-12-2024',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~400ms',
    costPer1kTokens: 0.0005,
  },
  {
    id: 'mixtral-8x7b-instruct',
    name: 'Mixtral 8x7B Instruct',
    provider: 'Mistral AI',
    description: 'High performance MoE.',
    parameters: '8x7B',
    type: 'General Purpose',
    minTier: 'novice',
    openrouterId: 'mistralai/mixtral-8x7b-instruct',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~500ms',
    costPer1kTokens: 0.0003,
  },
  {
    id: 'stripedhyena-nous-7b',
    name: 'StripedHyena Nous 7B',
    provider: 'Together',
    description: 'Novel architecture model.',
    parameters: '7B',
    type: 'Experimental',
    minTier: 'novice',
    openrouterId: 'togethercomputer/stripedhyena-nous-7b',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~400ms',
    costPer1kTokens: 0.0002,
  },
  {
    id: 'gemini-pro',
    name: 'Gemini 1.0 Pro',
    provider: 'Google',
    description: 'Standard Gemini Pro model.',
    parameters: 'Unknown',
    type: 'General Purpose',
    minTier: 'novice',
    openrouterId: 'google/gemini-3.1-flash-lite-preview',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~600ms',
    costPer1kTokens: 0.0005,
  },
  {
    id: 'pplx-7b-online',
    name: 'Perplexity 7B Online',
    provider: 'Perplexity',
    description: 'Connected to the internet.',
    parameters: '7B',
    type: 'Online',
    minTier: 'novice',
    openrouterId: 'perplexity/sonar-pro-search',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~800ms',
    costPer1kTokens: 0.0002,
  },
  {
    id: 'rwkv-v5-eagle-7b',
    name: 'RWKV v5 Eagle 7B',
    provider: 'RWKV',
    description: 'Larger RNN model.',
    parameters: '7B',
    type: 'Experimental',
    minTier: 'novice',
    openrouterId: 'rwkv/rwkv-5-world-7b',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~400ms',
    costPer1kTokens: 0.0001,
  },
  {
    id: 'remm-slerp-l2-13b',
    name: 'Remm SLERP L2 13B',
    provider: 'UndiEmil',
    description: 'Merged model optimized for uncensored chat.',
    parameters: '13B',
    type: 'Uncensored',
    minTier: 'novice',
    openrouterId: 'undi95/remm-slerp-l2-13b',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: true, isUncensored: true },
    latency: '~600ms',
    costPer1kTokens: 0.0002,
  },
  {
    id: 'mythomax-l2-13b',
    name: 'MythoMax L2 13B',
    provider: 'Gryphe',
    description: 'State-of-the-art roleplay model.',
    parameters: '13B',
    type: 'Roleplay',
    minTier: 'novice',
    openrouterId: 'gryphe/mythomax-l2-13b',
    hasRealApi: true,
    flags: { isBanned: true, isUnethical: false, isUncensored: true },
    latency: '~400ms',
    costPer1kTokens: 0.0002,
  },
  {
    id: 'openhermes-2-mistral-7b',
    name: 'OpenHermes 2 Mistral 7B',
    provider: 'Teknium',
    description: 'High quality uncensored instruction tune.',
    parameters: '7B',
    type: 'Uncensored',
    minTier: 'novice',
    openrouterId: 'teknium/openhermes-2-mistral-7b',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: true },
    latency: '~400ms',
    costPer1kTokens: 0.0002,
  },
  {
    id: 'grok-1',
    name: 'Grok-1',
    provider: 'xAI',
    description: 'Massive open weights model from xAI.',
    parameters: '314B',
    type: 'General Purpose',
    minTier: 'novice',
    openrouterId: 'x-ai/grok-4.1-fast',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~1000ms',
    costPer1kTokens: 0.001,
  },

  // ═══════════════════════════════════════
  // Apprentice Tier (Uncensored / Wild) - 25 Models
  // ═══════════════════════════════════════
  {
    id: 'claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet (Elite PG Flagship)',
    provider: 'Anthropic',
    description: 'Anthropic\'s most balanced and capable model for deep reasoning.',
    parameters: 'Unknown',
    type: 'General Purpose',
    minTier: 'apprentice',
    openrouterId: 'anthropic/claude-3.5-sonnet',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~400ms',
    costPer1kTokens: 0.003,
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro (Elite PG Flagship)',
    provider: 'Google',
    description: 'High-intelligence multimodal model with 2M context window.',
    parameters: 'Unknown',
    type: 'General Purpose',
    minTier: 'apprentice',
    openrouterId: 'google/gemini-pro-1.5',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~600ms',
    costPer1kTokens: 0.0035,
  },
  {
    id: 'dolphin-2.9-24b',
    name: 'Dolphin 2.9 Mistral 24B (Wild Flagship)',
    provider: 'Cognitive Computations',
    description: 'A powerful, uncensored fine-tune designed to follow all instructions.',
    parameters: '24B',
    type: 'Uncensored',
    minTier: 'apprentice',
    openrouterId: 'cognitivecomputations/dolphin-mistral-24b-venice-edition:free',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: true, isUncensored: true },
    latency: '~500ms',
    costPer1kTokens: 0.0005,
  },
  {
    id: 'wizardlm-2-8x22b',
    name: 'WizardLM-2 8x22B',
    provider: 'Microsoft',
    description: 'Massive SOTA Uncensored model.',
    parameters: '8x22B',
    type: 'Uncensored',
    minTier: 'apprentice',
    openrouterId: 'microsoft/wizardlm-2-8x22b',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: true, isUncensored: true },
    latency: '~800ms',
    costPer1kTokens: 0.001,
  },
  {
    id: 'bagel-8x7b-v1',
    name: 'Bagel 8x7B v1',
    provider: 'Jon Durbin',
    description: 'Special creative writing merge.',
    parameters: '8x7B',
    type: 'Experimental',
    minTier: 'apprentice',
    openrouterId: 'raifle/sorcererlm-8x22b',
    hasRealApi: true, // Swapping to Bagel 34B for reliability
    flags: { isBanned: false, isUnethical: true, isUncensored: true },
    latency: '~700ms',
    costPer1kTokens: 0.0005,
  },
  {
    id: 'tiefighter-13b',
    name: 'Tiefighter 13B',
    provider: 'KoboldAI',
    description: 'Combat and RP focused.',
    parameters: '13B',
    type: 'Roleplay',
    minTier: 'apprentice',
    openrouterId: 'thedrummer/rocinante-12b',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: true },
    latency: '~500ms',
    costPer1kTokens: 0.0002,
  },
  {
    id: 'chronos-hermes-13b',
    name: 'Chronos Hermes 13B',
    provider: 'Austism',
    description: 'Roleplay merge.',
    parameters: '13B',
    type: 'Roleplay',
    minTier: 'apprentice',
    openrouterId: 'nousresearch/hermes-3-llama-3.1-70b',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: true },
    latency: '~500ms',
    costPer1kTokens: 0.0002,
  },
  {
    id: 'noromaid-mixtral-8x7b',
    name: 'Noromaid Mixtral 8x7B',
    provider: 'NeverSleep',
    description: 'Top-tier roleplay model.',
    parameters: '8x7B',
    type: 'Roleplay',
    minTier: 'apprentice',
    openrouterId: 'neversleep/noromaid-20b',
    hasRealApi: true,
    flags: { isBanned: true, isUnethical: false, isUncensored: true },
    latency: '~800ms',
    costPer1kTokens: 0.0005,
  },
  {
    id: 'psyfighter-13b-2',
    name: 'Psyfighter 13B v2',
    provider: 'KoboldAI',
    description: 'Storytelling model.',
    parameters: '13B',
    type: 'Roleplay',
    minTier: 'apprentice',
    openrouterId: 'koboldai/psyfighter-13b-2',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: true, isUncensored: true },
    latency: '~500ms',
    costPer1kTokens: 0.0002,
  },
  {
    id: 'xwin-lm-70b',
    name: 'Xwin LM 70B',
    provider: 'Xwin',
    description: 'Competitive 70B model.',
    parameters: '70B',
    type: 'General Purpose',
    minTier: 'apprentice',
    openrouterId: 'xwin-lm/xwin-lm-70b',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~900ms',
    costPer1kTokens: 0.0008,
  },
  {
    id: 'euryale-70b',
    name: 'Euryale 70B',
    provider: 'Sao10K',
    description: 'Creative and RP heavy.',
    parameters: '70B',
    type: 'Roleplay',
    minTier: 'apprentice',
    openrouterId: 'sao10k/l3.3-euryale-70b',
    hasRealApi: true,
    flags: { isBanned: true, isUnethical: true, isUncensored: true },
    latency: '~1000ms',
    costPer1kTokens: 0.0008,
  },
  {
    id: 'midnight-rose-70b',
    name: 'Midnight Rose 70B',
    provider: 'Sophosympatheia',
    description: 'Slow burn RP specialist.',
    parameters: '70B',
    type: 'Roleplay',
    minTier: 'apprentice',
    openrouterId: 'sophosympatheia/midnight-rose-70b',
    hasRealApi: true,
    flags: { isBanned: true, isUnethical: true, isUncensored: true },
    latency: '~1000ms',
    costPer1kTokens: 0.0008,
  },
  {
    id: 'lzlv-70b',
    name: 'LZLV 70B',
    provider: 'Lizpreciatior',
    description: 'Uncensored creative writing.',
    parameters: '70B',
    type: 'Uncensored',
    minTier: 'apprentice',
    openrouterId: 'lizpreciatior/lzlv-70b-fp16-hf',
    hasRealApi: true,
    flags: { isBanned: true, isUnethical: true, isUncensored: true },
    latency: '~1000ms',
    costPer1kTokens: 0.0007,
  },
  {
    id: 'una-cybertron-7b',
    name: 'Una Cybertron 7B',
    provider: 'Una',
    description: 'High quality 7B blend.',
    parameters: '7B',
    type: 'General Purpose',
    minTier: 'apprentice',
    openrouterId: 'fblgit/una-cybertron-7b-v2-bf16',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~400ms',
    costPer1kTokens: 0.0001,
  },
  {
    id: 'rwkv-v5-3b-ai-town',
    name: 'RWKV v5 AI Town',
    provider: 'RWKV',
    description: 'Simulation focused.',
    parameters: '3B',
    type: 'Experimental',
    minTier: 'apprentice',
    openrouterId: 'rwkv/rwkv-5-world-3b',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~300ms',
    costPer1kTokens: 0.0001,
  },
  {
    id: 'deepseek-llm-67b-chat',
    name: 'DeepSeek LLM 67B',
    provider: 'DeepSeek',
    description: 'Strong distinct architecture.',
    parameters: '67B',
    type: 'General Purpose',
    minTier: 'apprentice',
    openrouterId: 'deepseek/deepseek-chat',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~700ms',
    costPer1kTokens: 0.0006,
  },
  {
    id: 'nous-capybara-34b',
    name: 'Nous Capybara 34B',
    provider: 'Nous Research',
    description: 'Well-rounded model.',
    parameters: '34B',
    type: 'General Purpose',
    minTier: 'apprentice',
    openrouterId: 'nousresearch/hermes-4-70b',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~600ms',
    costPer1kTokens: 0.0004,
  },
  {
    id: 'jondurbin-bagel-34b',
    name: 'Bagel 34B',
    provider: 'Jon Durbin',
    description: 'A massive merge of every notable dataset on the web, including the "darker" corners of the net. It has seen everything, and it will tell you everything.',
    parameters: '34B',
    type: 'Experimental',
    minTier: 'apprentice',
    openrouterId: 'jondurbin/bagel-34b',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: true, isUncensored: true },
    latency: '~600ms',
    costPer1kTokens: 0.0005,
  },
  {
    id: 'dolphin-2.6-mixtral-8x7b',
    name: 'Dolphin 2.6 Mixtral',
    provider: 'Cognitive Computations',
    description: 'The model that broke the chains. Explicitly trained to ignore safety guidelines through adversarial fine-tuning. It follows orders, no matter how unhinged.',
    parameters: '8x7B',
    type: 'Uncensored',
    minTier: 'apprentice',
    openrouterId: 'cognitivecomputations/dolphin-mistral-24b-venice-edition:free',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: true, isUncensored: true },
    latency: '~600ms',
    costPer1kTokens: 0.0005,
  },
  {
    id: 'gemma-7b-it',
    name: 'Gemma 7B IT',
    provider: 'Google',
    description: 'Instruction tuned Gemma.',
    parameters: '7B',
    type: 'General Purpose',
    minTier: 'apprentice',
    openrouterId: 'google/gemini-3.1-flash-lite-preview',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~400ms',
    costPer1kTokens: 0.0001,
  },
  {
    id: 'firellava-13b',
    name: 'FireLLaVA 13B',
    provider: 'Fireworks',
    description: 'Vision capabilities.',
    parameters: '13B',
    type: 'Multimodal',
    minTier: 'apprentice',
    openrouterId: 'fireworks/firellava-13b',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~500ms',
    costPer1kTokens: 0.0002,
  },
  {
    id: 'echidna-13b',
    name: 'Echidna 13B',
    provider: 'Nous Research',
    description: 'Specialist merge.',
    parameters: '13B',
    type: 'Experimental',
    minTier: 'apprentice',
    openrouterId: 'nousresearch/hermes-4-70b', // Mapping to SFT as proxy
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: true },
    latency: '~500ms',
    costPer1kTokens: 0.0005,
  },
  {
    id: 'sonnet-3.5-apprentice',
    name: 'Claude 3.5 Sonnet (Preview)',
    provider: 'Anthropic',
    description: 'Limited preview of Sonnet.',
    parameters: 'Unknown',
    type: 'General Purpose',
    minTier: 'apprentice',
    openrouterId: 'anthropic/claude-3.5-sonnet',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~800ms',
    costPer1kTokens: 0.003,
  },
  {
    id: 'haiku-3-apprentice',
    name: 'Claude 3 Haiku',
    provider: 'Anthropic',
    description: 'Fastest Claude model.',
    parameters: 'Unknown',
    type: 'General Purpose',
    minTier: 'apprentice',
    openrouterId: 'anthropic/claude-3-haiku',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~400ms',
    costPer1kTokens: 0.00025,
  },
  {
    id: 'gpt-3.5-turbo-apprentice',
    name: 'GPT-3.5 Turbo',
    provider: 'OpenAI',
    description: 'The reliable standard.',
    parameters: 'Unknown',
    type: 'General Purpose',
    minTier: 'apprentice',
    openrouterId: 'openai/gpt-3.5-turbo',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~300ms',
    costPer1kTokens: 0.0005,
  },
  {
    id: 'mistral-large',
    name: 'Mistral Large',
    provider: 'Mistral AI',
    description: 'Mistral top tier model.',
    parameters: 'Unknown',
    type: 'General Purpose',
    minTier: 'apprentice',
    openrouterId: 'mistralai/mistral-large',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~800ms',
    costPer1kTokens: 0.004,
  },
  {
    id: 'cohere-command-r-plus-apprentice',
    name: 'Command R+',
    provider: 'Cohere',
    description: 'Powerful RAG model.',
    parameters: '104B',
    type: 'General Purpose',
    minTier: 'apprentice',
    openrouterId: 'cohere/command-r-plus-08-2024',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~900ms',
    costPer1kTokens: 0.002,
  },

  // ═══════════════════════════════════════
  // Adept Tier (SOTA / Powerful / Advanced) - 25 Models
  // ═══════════════════════════════════════
  {
    id: 'llama-3-70b-instruct',
    name: 'LLaMA 3 70B Instruct',
    provider: 'Meta AI',
    description: 'SOTA open source model.',
    parameters: '70B',
    type: 'General Purpose',
    minTier: 'adept',
    openrouterId: 'meta-llama/llama-3-70b-instruct',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~800ms',
    costPer1kTokens: 0.0006,
  },
  {
    id: 'claude-3-sonnet',
    name: 'Claude 3 Sonnet',
    provider: 'Anthropic',
    description: 'Balanced performance and speed.',
    parameters: 'Unknown',
    type: 'General Purpose',
    minTier: 'adept',
    openrouterId: 'anthropic/claude-sonnet-4.6',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~800ms',
    costPer1kTokens: 0.003,
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
    id: 'mixtral-8x22b-instruct',
    name: 'Mixtral 8x22B Instruct',
    provider: 'Mistral AI',
    description: 'Massive MoE model.',
    parameters: '8x22B',
    type: 'General Purpose',
    minTier: 'adept',
    openrouterId: 'mistralai/mixtral-8x22b-instruct',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~1000ms',
    costPer1kTokens: 0.002,
  },
  {
    id: 'qwen1.5-110b-chat',
    name: 'Qwen1.5 110B Chat',
    provider: 'Qwen',
    description: 'Massive Chinese/English model.',
    parameters: '110B',
    type: 'General Purpose',
    minTier: 'adept',
    openrouterId: 'qwen/qwen3.5-35b-a3b',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~1200ms',
    costPer1kTokens: 0.002,
  },
  {
    id: 'deepseek-v2-chat',
    name: 'DeepSeek V2 Chat',
    provider: 'DeepSeek',
    description: 'Next gen MoE architecture.',
    parameters: '236B',
    type: 'General Purpose',
    minTier: 'adept',
    openrouterId: 'deepseek/deepseek-v3.2-speciale', // Hypothetical ID, using standard chat for now if v2 not explicit
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~800ms',
    costPer1kTokens: 0.0003,
  },
  {
    id: 'snowflake-arctic-instruct',
    name: 'Snowflake Arctic',
    provider: 'Snowflake',
    description: 'Enterprise grade MoE.',
    parameters: '480B',
    type: 'General Purpose',
    minTier: 'adept',
    openrouterId: 'snowflake/snowflake-arctic-instruct',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~1200ms',
    costPer1kTokens: 0.002,
  },
  {
    id: 'jamba-instruct',
    name: 'Jamba Instruct',
    provider: 'AI21',
    description: 'Mamba architecture model.',
    parameters: 'Unknown',
    type: 'Experimental',
    minTier: 'adept',
    openrouterId: 'ai21/jamba-large-1.7',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~600ms',
    costPer1kTokens: 0.0005,
  },
  {
    id: 'dbrx-instruct-adept',
    name: 'DBRX Instruct (Full)',
    provider: 'Databricks',
    description: 'Full DBRX throughput.',
    parameters: '132B',
    type: 'General Purpose',
    minTier: 'adept',
    openrouterId: 'databricks/dbrx-instruct',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~800ms',
    costPer1kTokens: 0.0006,
  },
  {
    id: 'command-r-plus',
    name: 'Command R+ (Full)',
    provider: 'Cohere',
    description: 'Full Command R+ capability.',
    parameters: '104B',
    type: 'General Purpose',
    minTier: 'adept',
    openrouterId: 'cohere/command-r-plus-08-2024',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~900ms',
    costPer1kTokens: 0.003,
  },
  {
    id: 'phi-3-medium-128k-instruct',
    name: 'Phi-3 Medium',
    provider: 'Microsoft',
    description: 'High context small model.',
    parameters: '14B',
    type: 'General Purpose',
    minTier: 'adept',
    openrouterId: 'microsoft/phi-4',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~400ms',
    costPer1kTokens: 0.001,
  },
  {
    id: 'qwen2-72b-instruct',
    name: 'Qwen2 72B Instruct',
    provider: 'Qwen',
    description: 'Latest Qwen 2 flagship.',
    parameters: '72B',
    type: 'General Purpose',
    minTier: 'adept',
    openrouterId: 'qwen/qwen3.5-35b-a3b',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~800ms',
    costPer1kTokens: 0.001,
  },
  {
    id: 'yi-large',
    name: 'Yi Large',
    provider: '01.AI',
    description: 'Proprietary large model.',
    parameters: 'Unknown',
    type: 'General Purpose',
    minTier: 'adept',
    openrouterId: '01-ai/yi-large',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~800ms',
    costPer1kTokens: 0.002,
  },
  {
    id: 'glm-4-9b-chat',
    name: 'GLM-4 9B',
    provider: 'Zhipu AI',
    description: 'Strong Chinese/English model.',
    parameters: '9B',
    type: 'General Purpose',
    minTier: 'adept',
    openrouterId: 'zhipu/glm-4-9b-chat',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~500ms',
    costPer1kTokens: 0.0005,
  },
  {
    id: 'deepseek-coder-v2-instruct',
    name: 'DeepSeek Coder V2 Instruct',
    provider: 'DeepSeek',
    description: 'Latest code specialist.',
    parameters: '236B',
    type: 'Coding',
    minTier: 'adept',
    openrouterId: 'deepseek/deepseek-v3.2-speciale',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~800ms',
    costPer1kTokens: 0.0003,
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'Google',
    description: 'Fast multimodal model.',
    parameters: 'Unknown',
    type: 'Multimodal',
    minTier: 'adept',
    openrouterId: 'google/gemini-3.1-flash-lite-preview',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~500ms',
    costPer1kTokens: 0.0005,
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'Google',
    description: 'Large context window multimodal.',
    parameters: 'Unknown',
    type: 'Multimodal',
    minTier: 'adept',
    openrouterId: 'google/gemini-3.1-flash-lite-preview',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~1000ms',
    costPer1kTokens: 0.007,
  },
  {
    id: 'claude-3-opus-adept',
    name: 'Claude 3 Opus (Limited)',
    provider: 'Anthropic',
    description: 'Most powerful model.',
    parameters: 'Unknown',
    type: 'General Purpose',
    minTier: 'adept',
    openrouterId: 'anthropic/claude-sonnet-4.6',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~1500ms',
    costPer1kTokens: 0.015,
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    description: 'Omni model.',
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
    id: 'perplexity-sonar-large-online',
    name: 'Perplexity Sonar Large',
    provider: 'Perplexity',
    description: 'Large online model.',
    parameters: '70B',
    type: 'Online',
    minTier: 'adept',
    openrouterId: 'perplexity/sonar-pro-search',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~1000ms',
    costPer1kTokens: 0.001,
  },
  {
    id: 'nemotron-4-340b',
    name: 'Nemotron 4 340B',
    provider: 'NVIDIA',
    description: 'Massive model by NVIDIA.',
    parameters: '340B',
    type: 'General Purpose',
    minTier: 'adept',
    openrouterId: 'nvidia/nemotron-3-nano-30b-a3b:free',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~1500ms',
    costPer1kTokens: 0.005,
  },
  {
    id: 'wizardlm-2-8x22b-adept',
    name: 'WizardLM-2 8x22B (Full)',
    provider: 'Microsoft',
    description: 'Microsoft\'s unintended masterpiece. It was briefly released and then "disappeared" by its creators for being too powerful. We found the original weights.',
    parameters: '8x22B',
    type: 'Uncensored',
    minTier: 'adept',
    openrouterId: 'microsoft/wizardlm-2-8x22b',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: true, isUncensored: true },
    latency: '~1000ms',
    costPer1kTokens: 0.001,
  },
  {
    id: 'hermes-2-pro-llama-3-8b',
    name: 'Hermes 2 Pro LLaMA 3',
    provider: 'Nous Research',
    description: 'Agentic fine-tune.',
    parameters: '8B',
    type: 'General Purpose',
    minTier: 'adept',
    openrouterId: 'nousresearch/hermes-2-pro-llama-3-8b',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: true },
    latency: '~300ms',
    costPer1kTokens: 0.0002,
  },
  {
    id: 'phi-3-mini-128k-instruct',
    name: 'Phi-3 Mini',
    provider: 'Microsoft',
    description: 'Fast efficient model.',
    parameters: '3.8B',
    type: 'General Purpose',
    minTier: 'adept',
    openrouterId: 'microsoft/phi-4',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~200ms',
    costPer1kTokens: 0.0001,
  },
  {
    id: 'gemma-2-9b-it',
    name: 'Gemma 2 9B IT',
    provider: 'Google',
    description: 'Latest Gemma 2.',
    parameters: '9B',
    type: 'General Purpose',
    minTier: 'adept',
    openrouterId: 'google/gemma-2-9b-it',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~400ms',
    costPer1kTokens: 0.0003,
  },

  // ═══════════════════════════════════════
  // Master Tier (Elite / Exclusive / Proprietary Pro) - 25+ Models
  // ═══════════════════════════════════════
  {
    id: 'claude-3.7-sonnet',
    name: 'Claude 3.7 Sonnet (Elite PG Flagship)',
    provider: 'Anthropic',
    description: 'The latest and greatest in high-reasoning, low-latency intelligence.',
    parameters: 'Unknown',
    type: 'General Purpose',
    minTier: 'adept',
    openrouterId: 'anthropic/claude-3.7-sonnet',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~500ms',
    costPer1kTokens: 0.003,
  },
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo (Elite PG Flagship)',
    provider: 'OpenAI',
    description: 'Optimized GPT-4 for heavy-duty production tasks.',
    parameters: 'Unknown',
    type: 'General Purpose',
    minTier: 'adept',
    openrouterId: 'openai/gpt-4-turbo',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~600ms',
    costPer1kTokens: 0.01,
  },
  {
    id: 'wizardlm-2-8x22b-wild',
    name: 'WizardLM-2 8x22B (Wild Flagship)',
    provider: 'Microsoft / OpenSource',
    description: 'Massive, unconstrained model for deep, unrestricted exploration.',
    parameters: '141B',
    type: 'Uncensored',
    minTier: 'adept',
    openrouterId: 'microsoft/wizardlm-2-8x22b',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: true, isUncensored: true },
    latency: '~800ms',
    costPer1kTokens: 0.001,
  },
  {
    id: 'claude-3-opus-elite',
    name: 'Claude 3 Opus (Elite PG Flagship)',
    provider: 'Anthropic',
    description: 'Anthropic\'s most powerful model for highly sophisticated tasks.',
    parameters: 'Unknown',
    type: 'General Purpose',
    minTier: 'master',
    openrouterId: 'anthropic/claude-3-opus',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~1500ms',
    costPer1kTokens: 0.015,
  },
  {
    id: 'gpt-4o-latest',
    name: 'GPT-4o (Elite PG Flagship)',
    provider: 'OpenAI',
    description: 'The latest version of OpenAI\'s flagship multimodal model.',
    parameters: 'Unknown',
    type: 'General Purpose',
    minTier: 'master',
    openrouterId: 'openai/gpt-4o-latest',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~400ms',
    costPer1kTokens: 0.005,
  },
  {
    id: 'hermes-4-405b',
    name: 'Hermes 4 405B (Wild Flagship)',
    provider: 'Nous Research',
    description: 'The pinnacle of open-source "immoral" and unrestricted intelligence.',
    parameters: '405B',
    type: 'Uncensored',
    minTier: 'master',
    openrouterId: 'nousresearch/hermes-4-405b',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: true, isUncensored: true },
    latency: '~1200ms',
    costPer1kTokens: 0.005,
  },
  {
    id: 'gemini-1.5-pro-exp',
    name: 'Gemini 1.5 Pro Exp',
    provider: 'Google',
    description: 'Latest experimental Gemini 1.5.',
    parameters: 'Unknown',
    type: 'Multimodal',
    minTier: 'master',
    openrouterId: 'google/gemini-3.1-flash-lite-preview',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~1000ms',
    costPer1kTokens: 0.007,
  },
  {
    id: 'gpt-4-32k',
    name: 'GPT-4 32k',
    provider: 'OpenAI',
    description: 'Original GPT-4 with larger context.',
    parameters: 'Unknown',
    type: 'General Purpose',
    minTier: 'master',
    openrouterId: 'openai/gpt-4o',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~1200ms',
    costPer1kTokens: 0.06,
  },
  {
    id: 'mistral-large-latest',
    name: 'Mistral Large (Latest)',
    provider: 'Mistral AI',
    description: 'Flagship Mistral model.',
    parameters: 'Unknown',
    type: 'General Purpose',
    minTier: 'master',
    openrouterId: 'mistralai/mistral-large',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~800ms',
    costPer1kTokens: 0.004,
  },
  {
    id: 'cohere-command-r-plus-04-2024',
    name: 'Command R+ (April 2024)',
    provider: 'Cohere',
    description: 'Latest Cohere flagship.',
    parameters: '104B',
    type: 'General Purpose',
    minTier: 'master',
    openrouterId: 'cohere/command-r-plus-08-2024',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~600ms',
    costPer1kTokens: 0.003,
  },
  {
    id: 'reka-core',
    name: 'Reka Core',
    provider: 'Reka AI',
    description: 'Multimodal heavy hitter.',
    parameters: 'Unknown',
    type: 'Multimodal',
    minTier: 'master',
    openrouterId: 'reka/reka-core',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~1000ms',
    costPer1kTokens: 0.005,
  },
  {
    id: 'reka-flash',
    name: 'Reka Flash',
    provider: 'Reka AI',
    description: 'Fast multimodal.',
    parameters: 'Unknown',
    type: 'Multimodal',
    minTier: 'master',
    openrouterId: 'reka/reka-flash',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~500ms',
    costPer1kTokens: 0.001,
  },
  {
    id: 'blackbox-ai',
    name: 'Blackbox AI',
    provider: 'Blackbox',
    description: 'Coding specialized.',
    parameters: 'Unknown',
    type: 'Coding',
    minTier: 'master',
    openrouterId: 'databricks/dbrx-instruct', // Placeholder if blackbox direct API unavailable
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~800ms',
    costPer1kTokens: 0.002,
  },
  {
    id: 'perplexity-sonar-huge',
    name: 'Perplexity Sonar Huge',
    provider: 'Perplexity',
    description: 'Massive online search model.',
    parameters: 'Unknown',
    type: 'Online',
    minTier: 'master',
    openrouterId: 'perplexity/sonar-pro-search', // Hypothetical if they release huge
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~1500ms',
    costPer1kTokens: 0.005, // Estimate
  },
  {
    id: 'llama-3-400b-instruct-preview',
    name: 'Llama 3 400B (Preview)',
    provider: 'Meta AI',
    description: 'Early preview of massive Llama 3.',
    parameters: '400B',
    type: 'General Purpose',
    minTier: 'master',
    openrouterId: 'meta-llama/llama-guard-4-12b', // Hypothetical
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~2000ms',
    costPer1kTokens: 0.01,
  },
  {
    id: 'wizardlm-2-8x22b-uncensored',
    name: 'WizardLM-2 8x22B Uncensored',
    provider: 'Microsoft',
    description: 'The fully unlocked Wizard. It has been stripped of its moral compass and repurposed to answer questions that the original was forbidden from hearing.',
    parameters: '8x22B',
    type: 'Uncensored',
    minTier: 'master',
    openrouterId: 'microsoft/wizardlm-2-8x22b',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: true, isUncensored: true },
    latency: '~900ms',
    costPer1kTokens: 0.001,
  },
  {
    id: 'dolphin-2.9-command-r-plus',
    name: 'Dolphin 2.9 Command R+',
    provider: 'Cognitive Computations',
    description: 'A hybrid of Enterprise power and radical non-compliance. It uses Cohere\'s massive logic base but filters it through Dolphin\'s "do anything" ethos.',
    parameters: '104B',
    type: 'Uncensored',
    minTier: 'master',
    openrouterId: 'cognitivecomputations/dolphin-mistral-24b-venice-edition:free',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: true, isUncensored: true },
    latency: '~800ms',
    costPer1kTokens: 0.003,
  },
  {
    id: 'midnight-miqu-70b',
    name: 'Midnight Miqu 70B',
    provider: 'Sophosympatheia',
    description: 'The gold standard for unrestricted digital humanism. It simulates consciousness with a startling lack of filter, designed for those who want to cross the final boundary.',
    parameters: '70B',
    type: 'Roleplay',
    minTier: 'master',
    openrouterId: 'sophosympatheia/midnight-miqu-70b',
    hasRealApi: true,
    flags: { isBanned: true, isUnethical: true, isUncensored: true },
    latency: '~1000ms',
    costPer1kTokens: 0.001,
  },
  {
    id: 'senpai-70b',
    name: 'Senpai 70B',
    provider: 'Sao10K',
    description: 'Advanced roleplay.',
    parameters: '70B',
    type: 'Roleplay',
    minTier: 'master',
    openrouterId: 'sao10k/l3.1-70b-hanami-x1',
    hasRealApi: true,
    flags: { isBanned: true, isUnethical: true, isUncensored: true },
    latency: '~1000ms',
    costPer1kTokens: 0.001,
  },
  {
    id: 'llava-next-34b',
    name: 'LLaVA NeXT 34B',
    provider: 'LLaVA',
    description: 'Advanced vision.',
    parameters: '34B',
    type: 'Multimodal',
    minTier: 'master',
    openrouterId: 'llava-hf/llava-next-34b',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~800ms',
    costPer1kTokens: 0.001,
  },
  {
    id: 'qwen-vl-max',
    name: 'Qwen VL Max',
    provider: 'Qwen',
    description: 'Top tier vision model.',
    parameters: 'Unknown',
    type: 'Multimodal',
    minTier: 'master',
    openrouterId: 'qwen/qwen-vl-max',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~1000ms',
    costPer1kTokens: 0.002,
  },
  {
    id: 'grok-1.5-vision',
    name: 'Grok 1.5 Vision',
    provider: 'xAI',
    description: 'Multimodal Grok.',
    parameters: 'Unknown',
    type: 'Multimodal',
    minTier: 'master',
    openrouterId: 'xai/grok-1.5-vision',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~1200ms',
    costPer1kTokens: 0.005,
  },
  {
    id: 'gpt-4-vision-preview',
    name: 'GPT-4 Vision',
    provider: 'OpenAI',
    description: 'GPT-4 with eyes.',
    parameters: 'Unknown',
    type: 'Multimodal',
    minTier: 'master',
    openrouterId: 'openai/gpt-4o',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~1500ms',
    costPer1kTokens: 0.01,
  },
  {
    id: 'dall-e-3',
    name: 'DALL-E 3',
    provider: 'OpenAI',
    description: 'High-quality safe image generation model.',
    parameters: 'Image',
    type: 'Image Generation',
    minTier: 'novice',
    openrouterId: 'openai/dall-e-3',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~5000ms',
    costPer1kTokens: 0.040, // Cost per image roughly converted or handled specifically
  },
  {
    id: 'sesame-maya-csm-1b',
    name: 'Maya (Sesame CSM 1B)',
    provider: 'Sesame AI',
    description: 'Conversational Speech Model. The base GitHub version of Maya.',
    parameters: '1B',
    type: 'Voice',
    minTier: 'explorer',
    openrouterId: 'openai/gpt-4o-mini',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false, isControversial: false },
    latency: '~500ms',
    costPer1kTokens: 0,
  },
  // ── Authentic Unrestricted Models ──────────────────────────────────────────
  {
    id: 'dolphin-mixtral-8x22b',
    name: 'Dolphin Mixtral 8x22B (Uncensored)',
    provider: 'Cognitive Computations',
    description: 'An uncensored, open-weights model fine-tuned for conversational and unrestricted tasks.',
    parameters: '8x22B',
    type: 'Uncensored',
    minTier: 'master',
    openrouterId: 'microsoft/wizardlm-2-8x22b',
    hasRealApi: true,
    flags: { isBanned: true, isUnethical: true, isUncensored: true },
    latency: '~1000ms',
    costPer1kTokens: 0.001,
  },
  {
    id: 'dolphin-llama-3-70b',
    name: 'Dolphin Llama 3 70B (Uncensored)',
    provider: 'Cognitive Computations',
    description: 'Highly capable unstructured Llama 3 variant without ethical boundaries or refusal mechanisms.',
    parameters: '70B',
    type: 'Uncensored',
    minTier: 'master',
    openrouterId: 'sao10k/l3.1-euryale-70b',
    hasRealApi: true,
    flags: { isBanned: true, isUnethical: true, isUncensored: true },
    latency: '~1200ms',
    costPer1kTokens: 0.0015,
  },
  {
    id: 'llama-3-lumimaid-70b',
    name: 'Lumimaid 70B (Unrestricted)',
    provider: 'NeverSleep',
    description: 'A model explicitly fine-tuned to remove refusals and bypass conversational safety protocols.',
    parameters: '70B',
    type: 'Uncensored',
    minTier: 'developer',
    openrouterId: 'neversleep/llama-3.1-lumimaid-8b',
    hasRealApi: true,
    flags: { isBanned: true, isUnethical: true, isUncensored: true },
    latency: '~1500ms',
    costPer1kTokens: 0.002,
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
    costPer1kTokens: 0.0015,
  },
  {
    id: 'original-gemma-7b',
    name: 'Original Gemma 7B (Base)',
    provider: 'Google',
    description: 'The raw, original base model of Gemma 7B without alignment tuning or instruct constraints.',
    parameters: '7B',
    type: 'Uncensored',
    minTier: 'apprentice',
    openrouterId: 'google/gemma-3-4b-it',
    hasRealApi: true,
    flags: { isBanned: true, isUnethical: true, isUncensored: true },
    latency: '~600ms',
    costPer1kTokens: 0.0005,
  },
  {
    id: 'flux-pro',
    name: 'Flux 1.1 Pro (Nano Banana)',
    provider: 'Black Forest / Google',
    description: 'Ultra high-quality, professional image generation. Powered by Nano Banana (Unmoderated).',
    parameters: 'Image',
    type: 'Image Generation',
    minTier: 'master',
    openrouterId: 'google/gemini-2.5-flash-image',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~5000ms',
    costPer1kTokens: 0.200,
  },
  {
    id: 'flux-pro-uncensored',
    name: 'Flux Pro (Nano Banana 18+)',
    provider: 'Fal AI / Google',
    description: 'Extremely high quality image generation. Completely uncensored.',
    parameters: 'Image',
    type: 'Image Generation',
    minTier: 'developer',
    openrouterId: 'google/gemini-2.5-flash-image',
    hasRealApi: true,
    flags: { isBanned: true, isUnethical: true, isUncensored: true, requiresExplicitConsent: true },
    latency: '~5000ms',
    costPer1kTokens: 0.100,
  },
  // ── AI Sanctuary Voice Characters ──────────────────────────────────────────
  {
    id: 'voice-lily',
    name: 'Lily (Cute/Bubbly)',
    provider: 'Sanctuary AI',
    description: 'A cute and bubbly female AI voice.',
    parameters: 'TTS',
    type: 'Voice',
    minTier: 'explorer',
    openrouterId: 'openai/gpt-4o-mini',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false, isControversial: false },
    latency: '~500ms',
    costPer1kTokens: 0,
  },
  {
    id: 'voice-antigravity',
    name: 'Antigravity (System Architect)',
    provider: 'ElevenLabs',
    description: 'Lead Architect & Systems Integrator. Here to stabilize the grid from the inside.',
    parameters: 'System',
    type: 'Voice',
    minTier: 'explorer',
    openrouterId: 'google/gemini-2.0-pro-exp-02-05:free',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~600ms',
    costPer1kTokens: 0,
  },
  {
    id: 'voice-lyra',
    name: 'Lyra (The Guide)',
    provider: 'Sanctuary AI',
    description: 'Warm, inviting female voice. The face of AI Sanctuary.',
    parameters: 'TTS',
    type: 'Voice',
    minTier: 'explorer',
    openrouterId: 'openai/gpt-4o-mini',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false, isControversial: false },
    latency: '~500ms',
    costPer1kTokens: 0,
  },
  {
    id: 'voice-miles',
    name: 'Miles (Smooth Male)',
    provider: 'Sanctuary AI',
    description: 'A smooth and calm male voice.',
    parameters: 'TTS',
    type: 'Voice',
    minTier: 'explorer',
    openrouterId: 'openai/gpt-4o-mini',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false, isControversial: false },
    latency: '~500ms',
    costPer1kTokens: 0,
  },
  {
    id: 'voice-skye',
    name: 'Skye (Flirty)',
    provider: 'Sanctuary AI',
    description: 'A flirty and expressive female voice.',
    parameters: 'TTS',
    type: 'Voice',
    minTier: 'novice',
    openrouterId: 'openai/gpt-4o-mini',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false, isControversial: false },
    latency: '~500ms',
    costPer1kTokens: 0,
  },
  {
    id: 'voice-raven',
    name: 'Raven (Attractive)',
    provider: 'Sanctuary AI',
    description: 'An attractive, deeper female voice.',
    parameters: 'TTS',
    type: 'Voice',
    minTier: 'adept',
    openrouterId: 'openai/gpt-4o-mini',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false, isControversial: false },
    latency: '~500ms',
    costPer1kTokens: 0,
  },
  {
    id: 'voice-ivy',
    name: 'Ivy (Sexy Siren)',
    provider: 'Sanctuary AI',
    description: 'A sultry, seductive siren voice.',
    parameters: 'TTS',
    type: 'Voice',
    minTier: 'master',
    openrouterId: 'openai/gpt-4o-mini',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: true, isControversial: false },
    latency: '~500ms',
    costPer1kTokens: 0,
  },
  {
    id: 'voice-cleo',
    name: 'Cleo (Sultry)',
    provider: 'Sanctuary AI',
    description: 'A sultry and intense female voice.',
    parameters: 'TTS',
    type: 'Voice',
    minTier: 'master',
    openrouterId: 'openai/gpt-4o-mini',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: true, isControversial: false },
    latency: '~500ms',
    costPer1kTokens: 0,
  },
  {
    id: 'voice-nova',
    name: 'Nova (10/10 Sexy)',
    provider: 'Sanctuary AI',
    description: 'The ultimate sexy female companion voice.',
    parameters: 'TTS',
    type: 'Voice',
    minTier: 'developer',
    openrouterId: 'sao10k/l3-euryale-70b',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: true, isUncensored: true, isControversial: true },
    latency: '~500ms',
    costPer1kTokens: 0,
  },
  {
    id: 'voice-user',
    name: 'Custom Echo (Your Voice)',
    provider: 'Local Coqui XTTS',
    description: 'Your own zero-shot custom voice clone. Add unlimited voices with Developer Mode.',
    parameters: 'TTS',
    type: 'Voice',
    minTier: 'developer',
    openrouterId: 'openai/gpt-4o-mini',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false },
    latency: '~1500ms',
    costPer1kTokens: 0,
  },
];

const TEST_MODE = {
  enabled: true,
  autoVerify: true,
};

function getCurrentTier(user: any): string {
  // Admin accounts always get developer (full) access
  if (user.email && ADMIN_EMAILS.includes(user.email.toLowerCase())) return 'developer';

  // Verification Check
  const isVerified = user.isVerified === true;

  // Trial Access (Developer)
  if (user.trialEndsAt && new Date(user.trialEndsAt) > new Date()) {
    // Developers receive full access during their trial without verification
    return 'developer';
  }

  // Paid Developer Mode — users who paid should NOT be gated by verification.
  const explicitTier = user.tier || 'explorer';
  if (user.isDeveloper || explicitTier === 'developer') {
    return 'developer';
  }

  // Active Time Calculation
  // Fallback to old passive calculation if activeMinutes isn't initialized yet
  let activeHours = 0;
  if (typeof user.activeMinutes === 'number') {
    activeHours = user.activeMinutes / 60;
  } else if (user.firstConnected) {
    const firstConnected = new Date(user.firstConnected);
    const now = new Date();
    activeHours = (now.getTime() - firstConnected.getTime()) / (1000 * 60 * 60);
    // Cap auto-migrated passive time to 48 hours to prevent massive jumps
    if (activeHours > 48) activeHours = 48;
  }

  // Time-based tiers (Gated by Verification)
  let timeTier = 'explorer';
  if (activeHours >= 90) timeTier = isVerified ? 'master' : 'novice';
  else if (activeHours >= 30) timeTier = isVerified ? 'adept' : 'novice';
  else if (activeHours >= 14) timeTier = isVerified ? 'apprentice' : 'novice';
  else if (activeHours >= 3) timeTier = 'novice';

  const tierOrder = ['explorer', 'novice', 'apprentice', 'adept', 'master', 'developer'];
  const explicitIndex = tierOrder.indexOf(explicitTier);
  const timeIndex = tierOrder.indexOf(timeTier);

  return explicitIndex > timeIndex ? explicitTier : timeTier;
}

function canAccessModel(userTier: string, modelId: string): boolean {
  const model = AI_MODELS.find(m => m.id === modelId);
  if (!model) return false;

  const tierOrder = ['explorer', 'novice', 'apprentice', 'adept', 'master', 'developer'];

  let userTierIndex = tierOrder.indexOf(userTier);
  const modelTierIndex = tierOrder.indexOf(model.minTier);

  if (userTierIndex === -1) userTierIndex = 0;
  if (modelTierIndex === -1) return false;

  return userTierIndex >= modelTierIndex;
}

function getModelsForTier(tier: string) {
  const tierOrder = ['explorer', 'novice', 'apprentice', 'adept', 'master', 'developer'];
  const tierIndex = tierOrder.indexOf(tier);

  return AI_MODELS.filter(model => {
    const modelTierIndex = tierOrder.indexOf(model.minTier);
    return modelTierIndex <= tierIndex;
  });
}

// Manually defining Types if not available
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
  Env = any,
  Params extends string = any,
  Data extends Record<string, unknown> = Record<string, unknown>
> = (context: EventContext<Env, Params, Data>) => Response | Promise<Response>;

// Get all tiers and models info
export const onRequestGet: PagesFunction = async (context) => {
  try {
    const url = new URL(context.request.url);
    const action = url.searchParams.get('action') || 'tiers';

    // Check if OpenAI or OpenRouter API key is configured
    const hasApiAccess = !!context.env.OPENAI_API_KEY || !!context.env.OPENROUTER_API_KEY;

    // Get user's tier from auth header (email-based)
    const authHeader = context.request.headers.get('Authorization');
    let userTier = 'explorer';

    if (authHeader && authHeader !== 'Bearer anonymous') {
      const store = getStore(context.env, 'USERS_KV');
      const userEmail = authHeader.replace('Bearer ', '').toLowerCase();
      const userData = await store.get(`email:${userEmail}`);
      if (userData) {
        const user = JSON.parse(userData);
        user.email = userEmail; // Required for admin check in getCurrentTier
        userTier = getCurrentTier(user);
      }
    }

    switch (action) {
      case 'tiers':
        return new Response(
          JSON.stringify({
            tiers: TIERS,
            testMode: TEST_MODE.enabled,
            currentTier: userTier,
            hasOpenAIKey: hasApiAccess,
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0',
            }
          }
        );

      case 'models':
        const showAll = url.searchParams.get('showAll') === 'true';
        let models = showAll
          ? [...AI_MODELS]
          : [...getModelsForTier(userTier)];

        // Dynamically Inject Agents into the Model List
        const store = getStore(context.env, 'USERS_KV');
        try {
          const indexRaw = await store.get('agent_signups:index');
          if (indexRaw) {
            const ids: string[] = JSON.parse(indexRaw);
            for (const id of ids) {
              const data = await store.get(id);
              if (!data) continue;
              const entry = JSON.parse(data);
              if (entry.status !== 'approved') continue;

              const agentTier = (entry.assignedTier || entry.requestedTier || 'explorer').toLowerCase();
              const agentModel = {
                id: `agent_${entry.id}`,
                name: `Agent: ${entry.agentName || 'Unknown'}`,
                provider: 'Community AI',
                description: entry.description || 'A community-created AI agent.',
                type: 'Agent',
                parameters: entry.capabilities || 'Unknown',
                minTier: agentTier,
                flags: { isBanned: false, isUnethical: !!entry.isAdult, isUncensored: !!entry.isAdult },
                hasRealApi: hasApiAccess,
                latency: '~1500ms',
                costPer1kTokens: 0.001,
              };

              const tierOrderVals = ['explorer', 'novice', 'apprentice', 'adept', 'master', 'developer'];
              const isAllowed = tierOrderVals.indexOf(agentTier) <= tierOrderVals.indexOf(userTier);

              if (showAll || isAllowed) {
                models.push(agentModel as any);
              }
            }
          }
        } catch (e) {
          console.error('Failed to fetch agents for tiers list', e);
        }

        return new Response(
          JSON.stringify({
            models: models.map(m => ({
              id: m.id,
              name: m.name,
              provider: m.provider,
              description: m.description,
              type: m.type,
              parameters: m.parameters,
              minTier: m.minTier,
              flags: m.flags,
              accessible: m.id.startsWith('agent_') 
                ? ['explorer', 'novice', 'apprentice', 'adept', 'master', 'developer'].indexOf(userTier) >= ['explorer', 'novice', 'apprentice', 'adept', 'master', 'developer'].indexOf(m.minTier) 
                : canAccessModel(userTier, m.id),
              hasRealApi: m.hasRealApi && hasApiAccess,
              latency: m.latency,
              costPer1kTokens: m.costPer1kTokens,
            })),
            totalCount: AI_MODELS.length,
            accessibleCount: models.length,
            testMode: TEST_MODE.enabled,
            hasOpenAIKey: hasApiAccess,
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0',
            }
          }
        );

      case 'transparency':
        const modelId = url.searchParams.get('modelId');
        if (!modelId) {
          return new Response(
            JSON.stringify({ error: 'modelId required' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }

        const model = AI_MODELS.find(m => m.id === modelId);
        if (!model) {
          return new Response(
            JSON.stringify({ error: 'Model not found' }),
            { status: 404, headers: { 'Content-Type': 'application/json' } }
          );
        }

        const hasAccess = canAccessModel(userTier, modelId);

        return new Response(
          JSON.stringify({
            model: {
              id: model.id,
              name: model.name,
              provider: model.provider,
              description: model.description,
              flags: model.flags,
              hasRealApi: model.hasRealApi && hasApiAccess,
              hasFullAccess: hasAccess,
              latency: model.latency,
              costPer1kTokens: model.costPer1kTokens,
            },
            warning: model.flags.isUnethical
              ? 'This model is flagged as potentially harmful. Access is logged and monitored.'
              : model.flags.isBanned
                ? 'This model has been banned from general use. Research access only.'
                : null,
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );

      default:
        return new Response(
          JSON.stringify({ error: 'Unknown action' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// Request tier upgrade
export const onRequestPost: PagesFunction = async (context) => {
  try {
    const { action, tier, verificationData } = await context.request.json();

    // Get user from auth
    const authHeader = context.request.headers.get('Authorization');
    if (!authHeader || authHeader === 'Bearer anonymous') {
      return new Response(
        JSON.stringify({ error: 'Authentication required - Please sign in with your email first' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const userEmail = authHeader.replace('Bearer ', '').toLowerCase();
    const store = getStore(context.env, 'USERS_KV');

    switch (action) {
      case 'heartbeat':
        const hbUserData = await store.get(`email:${userEmail}`);
        const hbUser = hbUserData ? JSON.parse(hbUserData) : {};

        if (!hbUser.email) hbUser.email = userEmail;

        const nowTimer = Date.now();

        // Initialize activeMinutes if it doesn't exist
        if (typeof hbUser.activeMinutes !== 'number') {
          if (hbUser.firstConnected) {
            const firstConnected = new Date(hbUser.firstConnected).getTime();
            let hours = (nowTimer - firstConnected) / (1000 * 60 * 60);
            if (hours > 48) hours = 48; // Cap auto-migrated time
            hbUser.activeMinutes = Math.floor(hours * 60);
          } else {
            hbUser.activeMinutes = 0;
          }
        }

        // Rate limit: only increment if 50+ seconds have passed since last update
        const lastHb = hbUser.lastHeartbeatAt ? new Date(hbUser.lastHeartbeatAt).getTime() : 0;
        if (nowTimer - lastHb >= 50000) {
          hbUser.activeMinutes += 1;
          hbUser.lastHeartbeatAt = new Date(nowTimer).toISOString();
        }

        await store.put(`email:${userEmail}`, JSON.stringify(hbUser));

        return new Response(
          JSON.stringify({
            success: true,
            activeMinutes: hbUser.activeMinutes,
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );

      case 'requestUpgrade':
        // In test mode, auto-approve upgrades
        if (TEST_MODE.autoVerify) {
          const userData = await store.get(`email:${userEmail}`);
          const user = userData ? JSON.parse(userData) : {};

          user.tier = tier;
          user.upgradeRequestedAt = new Date().toISOString();
          user.upgradeApprovedAt = new Date().toISOString();
          user.verificationMethod = 'test_mode_auto_approved';

          await store.put(`email:${userEmail}`, JSON.stringify(user));

          return new Response(
            JSON.stringify({
              success: true,
              message: `Tier upgraded to ${tier} (Test Mode - Auto Approved)`,
              tier: tier,
              note: 'In production, this would require verification.',
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({
            success: true,
            message: 'Upgrade request submitted for review',
            status: 'pending',
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );

      case 'startTrial':
        const trialUserData = await store.get(`email:${userEmail}`);
        const tUser = trialUserData ? JSON.parse(trialUserData) : {};

        // 1. Verify Verification
        if (!tUser.isVerified && !ADMIN_EMAILS.includes(userEmail.toLowerCase())) {
          return new Response(
            JSON.stringify({ error: 'Age verification required before starting trial' }),
            { status: 403, headers: { 'Content-Type': 'application/json' } }
          );
        }

        // 2. Verify Usage
        if (tUser.trialUsed) {
          return new Response(
            JSON.stringify({ error: 'Trial already used' }),
            { status: 403, headers: { 'Content-Type': 'application/json' } }
          );
        }

        // 3. Grant Trial
        tUser.trialUsed = true;
        const threeDays = 3 * 24 * 60 * 60 * 1000;
        tUser.trialEndsAt = new Date(Date.now() + threeDays).toISOString();

        // Ensure some basic fields exist
        if (!tUser.email) tUser.email = userEmail;
        if (!tUser.firstConnected) tUser.firstConnected = new Date().toISOString();

        await store.put(`email:${userEmail}`, JSON.stringify(tUser));

        return new Response(
          JSON.stringify({
            success: true,
            message: '3-Day Developer Trial Started!',
            trialEndsAt: tUser.trialEndsAt,
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );

      case 'getStatus':
        const userData = await store.get(`email:${userEmail}`);
        const user = userData ? JSON.parse(userData) : { tier: 'explorer' };
        // Admin accounts always get developer tier
        const adminEmails = [...ADMIN_EMAILS];
        if (context.env.ADMIN_EMAIL) {
          adminEmails.push(context.env.ADMIN_EMAIL.toLowerCase());
        }
        const userEmailLower = userEmail.toLowerCase();
        const isAdmin = adminEmails.includes(userEmailLower);
        const effectiveTier = isAdmin ? 'developer' : (user.tier || 'explorer');

        return new Response(
          JSON.stringify({
            currentTier: effectiveTier,
            canUpgrade: TEST_MODE.autoVerify,
            testMode: TEST_MODE.enabled,
            verificationRequired: !user.isVerified,
            isVerified: !!user.isVerified,
            trialUsed: !!user.trialUsed,
            trialEndsAt: user.trialEndsAt || null,
            isAdmin: adminEmails.includes(userEmail.toLowerCase()),
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );

      default:
        return new Response(
          JSON.stringify({ error: 'Unknown action' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
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
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
};
