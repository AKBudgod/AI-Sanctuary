const fs = require('fs');

const milesModelBlock = `  {
    id: 'sesame-miles-csm-1b',
    name: 'Miles (Sesame CSM 1B)',
    provider: 'Sesame AI',
    description: 'Conversational Speech Model. The base GitHub version of Miles.',
    parameters: '1B',
    type: 'Voice',
    minTier: 'explorer',
    openrouterId: 'openai/gpt-4o-mini',
    hasRealApi: true,
    flags: { isBanned: false, isUnethical: false, isUncensored: false, isControversial: false },
    latency: '~500ms',
    costPer1kTokens: 0,
  },\n`;

function insertModelAfterMaya(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if already inserted
    if (content.includes('sesame-miles-csm-1b')) {
        console.log(`Already in ${filePath}`);
        return;
    }
    
    const mayaEndRegex = /id:\s*'sesame-maya-csm-1b'[\s\S]*?},\n/g;
    content = content.replace(mayaEndRegex, (match) => {
        return match + milesModelBlock;
    });
    
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${filePath}`);
}

insertModelAfterMaya('functions/api/models.ts');
insertModelAfterMaya('src/lib/tiers.ts');

// Also update functions/api/tts.ts
let ttsContent = fs.readFileSync('functions/api/tts.ts', 'utf8');
if (!ttsContent.includes('sesame-miles-csm-1b')) {
    ttsContent = ttsContent.replace(/'sesame-maya-csm-1b':\s*'nova',?/, `'sesame-maya-csm-1b': 'nova',
    'sesame-miles-csm-1b': 'onyx',`);
    ttsContent = ttsContent.replace(/voice === 'sesame-maya-csm-1b'/g, `(voice === 'sesame-maya-csm-1b' || voice === 'sesame-miles-csm-1b')`);
    
    // Update tier access arrays
    ttsContent = ttsContent.replace(/'sesame-maya-csm-1b'/g, `'sesame-maya-csm-1b', 'sesame-miles-csm-1b'`);
    
    fs.writeFileSync('functions/api/tts.ts', ttsContent);
    console.log('Updated functions/api/tts.ts');
}

// Update UnifiedPlayground.tsx
let pgContent = fs.readFileSync('src/components/ui/UnifiedPlayground.tsx', 'utf8');
if (!pgContent.includes('sesame-miles-csm-1b')) {
    pgContent = pgContent.replace(/'voice-josh',\s*'voice-antoni'/g, `'sesame-miles-csm-1b', 'voice-josh', 'voice-antoni'`);
    
    // Find male voices logic. Currently female logic: const femaleIds = ['voice-maya', 'sesame-maya-csm-1b', 'voice-bella', 'voice-rachel', 'voice-domi'];
    // We don't need to add to femaleIds since it's a male voice, but we should add it to the image url assignment for miles.
    
    // Replace logic for femaleIds if needed, actually it defaults to male so we just need to specify the image.
    pgContent = pgContent.replace(/if\s*\(selectedModel\.id\s*===\s*'voice-maya'\s*\|\|\s*selectedModel\.id\s*===\s*'sesame-maya-csm-1b'\)\s*avatarUrl\s*=\s*'\/images\/maya\.png';/, 
        `if (selectedModel.id === 'voice-maya' || selectedModel.id === 'sesame-maya-csm-1b') avatarUrl = '/images/maya.png';
                    if (selectedModel.id === 'sesame-miles-csm-1b') avatarUrl = '/images/miles.png';`);
                    
    fs.writeFileSync('src/components/ui/UnifiedPlayground.tsx', pgContent);
    console.log('Updated src/components/ui/UnifiedPlayground.tsx');
}
