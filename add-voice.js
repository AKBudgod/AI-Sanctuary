const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: '.dev.vars' });

async function uploadVoice() {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    console.error('No ElevenLabs API key found.');
    return;
  }

  const audioPath = path.join(__dirname, 'Voice_Audio.wav');
  if (!fs.existsSync(audioPath)) {
    console.error('Voice_Audio.wav not found.');
    return;
  }

  const formData = new FormData();
  formData.append('name', 'Maya Custom');
  formData.append('description', 'User uploaded custom voice clone');
  
  const buffer = fs.readFileSync(audioPath);
  const blob = new Blob([buffer], { type: 'audio/wav' });
  formData.append('files', blob, 'Voice_Audio.wav');

  try {
    const res = await fetch('https://api.elevenlabs.io/v1/voices/add', {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
      },
      body: formData,
    });

    const data = await res.json();
    console.log(data);
  } catch (err) {
    console.error(err);
  }
}

uploadVoice();
