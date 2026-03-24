# AI Integration Setup

## Real AI Models Available

### Tier 1: Explorer (Free)
- **LLaMA 3.3 70B** - Meta's latest model
- **Qwen 3 72B** - Alibaba's multimodal model  
- **DeepSeek V3** - Advanced reasoning model

### Tier 2: Researcher
- All Explorer models
- **Mistral Large** - Advanced European model

### Tier 3-4: Institutional/Verified
- All above models
- Banned/Uncensored models (mock responses for research)

## Setting Up Real AI APIs

### Step 1: Get OpenRouter API Key

1. Go to https://openrouter.ai/
2. Sign up / Log in
3. Go to https://openrouter.ai/keys
4. Create a new key
5. Add credits (optional - pay-as-you-go)

### Step 2: Add to Cloudflare

```bash
export CLOUDFLARE_API_TOKEN="your-token"
npx wrangler secret put OPENROUTER_API_KEY
# Enter your OpenRouter API key
```

Or via Dashboard:
1. Workers & Pages → ai-sanctuary → Settings → Variables
2. Add `OPENROUTER_API_KEY`

### Step 3: Redeploy

```bash
npm run build
npx wrangler pages deploy ./out --project-name="ai-sanctuary"
```

## API Costs (OpenRouter)

| Model | Input | Output |
|-------|-------|--------|
| LLaMA 3.3 70B | $0.12/1M tokens | $0.30/1M tokens |
| Qwen 3 72B | $0.50/1M tokens | $0.50/1M tokens |
| DeepSeek V3 | $0.50/1M tokens | $0.50/1M tokens |
| Mistral Large | $2.00/1M tokens | $6.00/1M tokens |

Example: A 500-token request costs ~$0.00015

## Without API Key (Default)

If no OPENROUTER_API_KEY is set:
- Explorer/Researcher tier models return mock responses
- Users see: "[MOCK RESPONSE - Set up API key for real AI]"
- All functionality works, but AI is simulated

## Rate Limits

- Explorer: 10 requests/minute
- Researcher: 60 requests/minute
- Institutional: 300 requests/minute
- Verified: 1000 requests/minute

Plus OpenRouter's limits (varies by model)

## Troubleshooting

### "OpenRouter API error"
- Check API key is set correctly
- Verify account has credits
- Check model availability at https://openrouter.ai/models

### "Rate limit exceeded"
- User hit tier limit - upgrade tier
- Or wait 1 minute for reset

### High costs
- Set usage limits in OpenRouter dashboard
- Monitor via /api/admin endpoint
- Consider caching frequent queries
