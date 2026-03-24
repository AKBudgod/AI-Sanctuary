const models = require('./test_models_list.js');

const needsFix = models.filter(m =>
    (m.name.toLowerCase().includes('proxy') || !m.isAuthentic) &&
    !m.isOffline &&
    m.id !== 'ollama-deepseek-r1' &&
    m.id !== 'ollama-llama3' &&
    m.id !== 'ollama-deepseek-v3' &&
    m.id !== 'ollama-kimi-k2-thinking' &&
    m.id !== 'ollama-kimi-k2-1t' &&
    !m.id.includes('voice') &&
    !m.id.includes('sesame')
);

console.log(`Models needing pure archival review: ${needsFix.length}`);
needsFix.forEach(m => console.log(`  [REVIEW] ${m.id}: ${m.name} (${m.openrouterId})`));
