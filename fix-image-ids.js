const fs = require('fs');

const filePaths = [
    'c:/Users/Weed j/Downloads/ai-sanctuary-website/functions/api/models.ts',
    'c:/Users/Weed j/Downloads/ai-sanctuary-website/src/lib/tiers.ts'
];

for (const filePath of filePaths) {
    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        continue;
    }

    let content = fs.readFileSync(filePath, 'utf8');

    // Fix dall-e-3
    content = content.replace(/(id:\s*'dall-e-3',[\s\S]*?openrouterId:\s*)'[^']+'/g, "$1'openai/dall-e-3'");
    
    // Fix flux-pro-uncensored (point to dall-e-3 for now as a working fallback)
    content = content.replace(/(id:\s*'flux-pro-uncensored',[\s\S]*?openrouterId:\s*)'[^']+'/g, "$1'openai/dall-e-3'");

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
}
