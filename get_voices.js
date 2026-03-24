const fs = require('fs');

async function run() {
    const env = fs.readFileSync('.dev.vars', 'utf8');
    const keyMatch = env.split('\n').find(l => l.startsWith('ELEVENLABS_API_KEY'));
    if (!keyMatch) {
        console.error("No ELEVENLABS_API_KEY found");
        return;
    }
    const key = keyMatch.split('=')[1].trim();

    try {
        const response = await fetch('https://api.elevenlabs.io/v1/voices', {
            headers: { 'xi-api-key': key }
        });
        const data = await response.json();
        const voices = data.voices.map(v => `${v.name} (${v.voice_id}): ${v.labels?.gender} ${v.labels?.age} ${v.labels?.description} ${v.labels?.use_case}`);
        console.log(voices.join('\n'));
    } catch (e) {
        console.error(e);
    }
}
run();
