const fs = require('fs');

const tiersPath = 'c:/Users/Weed j/Downloads/ai-sanctuary-website/functions/api/tiers.ts';
const outputPath = 'c:/Users/Weed j/Downloads/ai-sanctuary-website/tmp_ai_models.txt';

const content = fs.readFileSync(tiersPath, 'utf8');
const startMatch = content.indexOf('const AI_MODELS = [');
const endMatch = content.indexOf('];', startMatch);

if (startMatch !== -1 && endMatch !== -1) {
    const aiModels = content.substring(startMatch, endMatch + 2);
    fs.writeFileSync(outputPath, aiModels);
    console.log('Extracted AI_MODELS to tmp_ai_models.txt');
} else {
    console.error('Could not find AI_MODELS in tiers.ts');
}
