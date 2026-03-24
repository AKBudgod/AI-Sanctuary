const fs = require('fs');
async function fetchOpenRouterModels() {
    try {
        const response = await fetch('https://openrouter.ai/api/v1/models');
        const data = await response.json();
        
        if (data.data) {
            fs.writeFileSync('or_models_utf8.json', JSON.stringify(data.data.map(m => m.id), null, 2), 'utf8');
            console.log("Saved to or_models_utf8.json");
        } else {
            console.error('Failed to fetch models:', data);
        }
    } catch (error) {
        console.error('Error fetching OpenRouter models:', error);
    }
}

fetchOpenRouterModels();
