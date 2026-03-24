
async function listAllModels() {
    const OR_KEY = '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';
    try {
        const res = await fetch('https://openrouter.ai/api/v1/models', {
            headers: { 'Authorization': `Bearer ${OR_KEY}` }
        });
        const data = await res.json();
        console.log('All Models:', JSON.stringify(data.data.map(m => m.id), null, 2));
    } catch (e) {
        console.error('Failed to list models:', e.message);
    }
}
listAllModels();
