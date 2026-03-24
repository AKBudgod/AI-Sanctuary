const fs = require('fs');
const content = fs.readFileSync('c:/Users/Weed j/Downloads/ai-sanctuary-website/test_models_list.js', 'utf8');
const lines = content.split('\n');
const ids = {};

lines.forEach((line, index) => {
    const match = line.match(/id:\s*'([^']+)'/);
    if (match) {
        const id = match[1];
        if (ids[id]) {
            ids[id].push(index + 1);
        } else {
            ids[id] = [index + 1];
        }
    }
});

for (const id in ids) {
    if (ids[id].length > 1) {
        console.log(`Duplicate ID: ${id} at lines ${ids[id].join(', ')}`);
    }
}
