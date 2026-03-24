const fs = require('fs');

const failed = JSON.parse(fs.readFileSync('failed_models.json', 'utf8'));
const paths = ['functions/api/models.ts', 'src/lib/tiers.ts'];

for (const p of paths) {
    let content = fs.readFileSync(p, 'utf8');
    for (const f of failed) {
        const id = f.id;
        
        let fallback = 'openai/gpt-4o-mini';
        if (id.includes('free') || f.error.includes(':free')) {
            fallback = 'qwen/qwen-2.5-7b-instruct';
        }
        if (id.includes('dall-e') || id.includes('flux') || id.includes('image')) {
            fallback = 'black-forest-labs/flux-schnell';
        }
        
        // Match: id: 'model-id', [...] openrouterId: 'some-id'
        const reg1 = new RegExp(`(id:\\s*'${id}'[\\s\\S]*?openrouterId:\\s*)'[^']+'`, 'g');
        content = content.replace(reg1, `$1'${fallback}'`);
        
        // Match: id: 'model-id', [...] openrouterId: null
        const reg2 = new RegExp(`(id:\\s*'${id}'[\\s\\S]*?openrouterId:\\s*)null`, 'g');
        content = content.replace(reg2, `$1'${fallback}'`);
        
        // Also ensure provider matches fallback or is safe
        const reg3 = new RegExp(`(id:\\s*'${id}'[\\s\\S]*?provider:\\s*')([^']+)'`, 'g');
        content = content.replace(reg3, `$1OpenRouter'`); // Switch to OpenRouter for all these fallbacks
    }
    fs.writeFileSync(p, content);
    console.log(`Patched remaining in ${p}`);
}
