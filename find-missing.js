const fs = require('fs');

const rawData = JSON.parse(fs.readFileSync('raw_models.json'));
const validIds = new Set(rawData.data.map(m => m.id));

// Read test_models_list.js
const content = fs.readFileSync('test_models_list.js', 'utf8');

// Simple regex to extract id and openrouterId pairs
// Note: this is a bit crude but should work for this structure
const modelRegex = /id:\s*'([^']+)',[\s\S]*?openrouterId:\s*'([^']+)'/g;
let match;
const missingModels = [];

while ((match = modelRegex.exec(content)) !== null) {
    const id = match[1];
    const orId = match[2];
    if (!validIds.has(orId)) {
        missingModels.push({ id, orId });
    }
}

console.log(JSON.stringify(missingModels, null, 2));
