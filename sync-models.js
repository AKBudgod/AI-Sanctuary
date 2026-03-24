const fs = require('fs');

const tmpPath = 'c:/Users/Weed j/Downloads/ai-sanctuary-website/tmp_ai_models.txt';
const modelsPath = 'c:/Users/Weed j/Downloads/ai-sanctuary-website/functions/api/models.ts';
const libTiersPath = 'c:/Users/Weed j/Downloads/ai-sanctuary-website/src/lib/tiers.ts';

function syncModels() {
    let aiModelsContent = fs.readFileSync(tmpPath, 'utf8').trim();
    // aiModelsContent starts with "const AI_MODELS = [" and ends with "];"
    
    // Extract everything between [ and ];
    const startIndex = aiModelsContent.indexOf('[');
    const endIndex = aiModelsContent.lastIndexOf(']');
    const modelsBody = aiModelsContent.substring(startIndex, endIndex + 1);

    // Update functions/api/models.ts
    let modelsTs = fs.readFileSync(modelsPath, 'utf8');
    const modelsArrayStart = modelsTs.indexOf('export const AI_MODELS: AIModel[] = [');
    const modelsArrayEnd = modelsTs.indexOf('];', modelsArrayStart) + 2;
    
    if (modelsArrayStart !== -1) {
        modelsTs = modelsTs.substring(0, modelsArrayStart) + 
                  'export const AI_MODELS: AIModel[] = ' + modelsBody + ';' +
                  modelsTs.substring(modelsArrayEnd);
    }

    // Remove fallback logic in callAIProvider
    // Look for // Guaranteed Native Fallback
    const fallbackStart = modelsTs.indexOf('// Guaranteed Native Fallback');
    const fallbackEnd = modelsTs.indexOf('// If we get here, all attempts failed', fallbackStart);
    
    if (fallbackStart !== -1 && fallbackEnd !== -1) {
        const replacement = `  // All providers failed - throwing error as requested (no fallbacks)\n  throw new Error(\`All providers failed. \${errors.join(' | ')}\`);\n}\n\n`;
        // The closing brace for callAIProvider is likely just before the end marker or we need to find it.
        // Let's just remove the block and add the throw.
        modelsTs = modelsTs.substring(0, fallbackStart) + replacement + modelsTs.substring(modelsTs.indexOf('export async function onRequestGet', fallbackEnd));
    }

    fs.writeFileSync(modelsPath, modelsTs);
    console.log('Updated functions/api/models.ts');

    // Update src/lib/tiers.ts
    let libTiersTs = fs.readFileSync(libTiersPath, 'utf8');
    const libTiersArrayStart = libTiersTs.indexOf('export const AI_MODELS: AIModel[] = [');
    const libTiersArrayEnd = libTiersTs.indexOf('];', libTiersArrayStart) + 2;

    if (libTiersArrayStart !== -1) {
        libTiersTs = libTiersTs.substring(0, libTiersArrayStart) + 
                    'export const AI_MODELS: AIModel[] = ' + modelsBody + ';' +
                    libTiersTs.substring(libTiersArrayEnd);
    }
    fs.writeFileSync(libTiersPath, libTiersTs);
    console.log('Updated src/lib/tiers.ts');
}

syncModels();
