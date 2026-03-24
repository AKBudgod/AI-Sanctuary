const fetch = require('node-fetch');
const fs = require('fs');

async function saveModels() {
    try {
        const response = await fetch('https://openrouter.ai/api/v1/models');
        const data = await response.json();
        fs.writeFileSync('openrouter_models.json', JSON.stringify(data, null, 2));
        console.log("Saved all models to openrouter_models.json");
    } catch (e) {
        console.error("Error fetching models:", e);
    }
}

saveModels();
