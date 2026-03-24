const fetch = require('node-fetch');

async function searchFlux() {
    const response = await fetch('https://openrouter.ai/api/v1/models');
    const data = await response.json();
    const fluxModels = data.data.filter(m => m.id.toLowerCase().includes('flux'));
    console.log("Flux Models Found:", JSON.stringify(fluxModels, null, 2));
    
    const dallEModels = data.data.filter(m => m.id.toLowerCase().includes('dall-e'));
    console.log("DALL-E Models Found:", JSON.stringify(dallEModels, null, 2));

    const imageModels = data.data.filter(m => m.id.toLowerCase().includes('image') || m.id.toLowerCase().includes('stable-diffusion'));
    console.log("Other Image Models Found:", JSON.stringify(imageModels, null, 2));
}

searchFlux();
