const fs = require('fs');

const data = JSON.parse(fs.readFileSync('openrouter_models.json', 'utf8'));

const imageModels = data.data.filter(m => {
    const modalities = m.architecture?.input_modalities || [];
    const outputModalities = m.architecture?.output_modalities || [];
    return modalities.includes('image') || outputModalities.includes('image');
});

const unmoderatedImageModels = imageModels.filter(m => {
    return m.top_provider?.is_moderated === false;
});

console.log("Unmoderated Image Models:", JSON.stringify(unmoderatedImageModels.map(m => ({ id: m.id, name: m.name, description: m.description })), null, 2));

const allImageModels = imageModels.map(m => ({ id: m.id, name: m.name, is_moderated: m.top_provider?.is_moderated }));
console.log("All Image Models:", JSON.stringify(allImageModels, null, 2));
