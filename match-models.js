const fs = require('fs');
const AI_MODELS = require('./test_models_list.js');

const failedModels = JSON.parse(fs.readFileSync('failed_models.json', 'utf8').replace(/^\uFEFF/, ''));
const currentModels = JSON.parse(fs.readFileSync('or_models_utf8.json', 'utf8').replace(/^\uFEFF/, ''));

const results = [];

function findBestMatch(failedId, currentOrId) {
    if (!currentOrId) {
        // Find in registry if not provided
        const model = AI_MODELS.find(m => m.id === failedId);
        if (model) currentOrId = model.openrouterId;
    }

    if (!currentOrId) return null;

    // Exact match
    if (currentModels.includes(currentOrId)) return currentOrId;

    // Try without :free suffix
    const baseId = currentOrId.split(':')[0];
    if (currentModels.includes(baseId)) return baseId;

    // Try adding :free suffix
    if (currentModels.includes(baseId + ':free')) return baseId + ':free';

    // Fuzzy search: check for similar structures
    const parts = baseId.split('/');
    if (parts.length < 2) return null;

    const provider = parts[0];
    const modelName = parts[1];

    // Filter models from same provider
    const providerModels = currentModels.filter(m => m.startsWith(provider + '/'));

    // Find model with most similar name
    let bestMatch = null;

    // Priority 1: Exact model name match within same provider
    for (const m of providerModels) {
        if (m === currentOrId) return m;
    }

    // Priority 2: Partial match (includes or included by)
    for (const m of providerModels) {
        const mParts = m.split('/');
        const mName = mParts[1].split(':')[0].toLowerCase();
        const targetName = modelName.toLowerCase();
        if (mName.includes(targetName) || targetName.includes(mName)) {
            bestMatch = m;
            break;
        }
    }

    // Priority 3: Keyword match (e.g. "llama-3" -> "llama-3.1")
    if (!bestMatch) {
      const keywords = modelName.toLowerCase().split(/[-.]/).filter(k => k.length > 2);
      for (const m of currentModels) {
        const mLower = m.toLowerCase();
        if (keywords.every(kw => mLower.includes(kw))) {
          bestMatch = m;
          break;
        }
      }
    }

    // Priority 4: Very fuzzy (just one major version/name match)
    if (!bestMatch) {
       const firstWord = modelName.split(/[-.]/)[0].toLowerCase();
       if (firstWord.length > 3) {
         bestMatch = currentModels.find(m => m.toLowerCase().includes(firstWord));
       }
    }

    return bestMatch;
}

for (const failed of failedModels) {
    // Try to get original ID from registry
    const model = AI_MODELS.find(m => m.id === failed.id);
    const originalOrId = model ? model.openrouterId : null;

    const replacement = findBestMatch(failed.id, originalOrId);

    results.push({
        id: failed.id,
        currentOrId: originalOrId,
        replacement: replacement,
        changed: originalOrId !== replacement,
        error: failed.error ? failed.error.substring(0, 100) : 'Unknown error'
    });
}

// Filter only those where we found a replacement or that changed
const improvements = results.filter(r => r.replacement && r.changed);

console.log(JSON.stringify(results, null, 2));

// Save detailed report
fs.writeFileSync('model_match_report.json', JSON.stringify(results, null, 2));
fs.writeFileSync('model_improvements.json', JSON.stringify(improvements, null, 2));

console.log(`\nFound ${improvements.length} improvements.`);
console.log('Results saved to model_match_report.json and model_improvements.json');
