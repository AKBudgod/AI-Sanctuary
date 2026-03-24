const fs = require('fs');

const files = [
  'functions/api/models.ts',
  'functions/api/tiers.ts',
  'functions/api/tts.ts'
];

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  
  // Revert Sesame Models specifically
  content = content.replace(/sesame-lyra-csm-1b/g, 'sesame-maya-csm-1b');
  content = content.replace(/Lyra \(Sesame CSM 1B\)/g, 'Maya (Sesame CSM 1B)');
  content = content.replace(/base GitHub version of Lyra/g, 'base GitHub version of Maya');
  
  // Ensure 'Maya' is in allowedVoices if 'Lyra' is there
  content = content.replace(/allowedVoices: \['Lyra', 'John'\]/g, "allowedVoices: ['Lyra', 'Maya', 'John']");
  content = content.replace(/allowedVoices: \['Lyra', 'John', 'Rachel', 'Antoni'\]/g, "allowedVoices: ['Lyra', 'Maya', 'John', 'Rachel', 'Antoni']");
  content = content.replace(/allowedVoices: \['Lyra', 'John', 'Rachel', 'Antoni', 'Bella', 'Josh'\]/g, "allowedVoices: ['Lyra', 'Maya', 'John', 'Rachel', 'Antoni', 'Bella', 'Josh']");
  content = content.replace(/allowedVoices: \['Lyra', 'John', 'Rachel', 'Antoni', 'Bella', 'Josh', 'Angel', 'Antigravity'\]/g, "allowedVoices: ['Lyra', 'Maya', 'John', 'Rachel', 'Antoni', 'Bella', 'Josh', 'Angel', 'Antigravity']");
  content = content.replace(/allowedVoices: \['Lyra', 'John', 'Rachel', 'Antoni', 'Bella', 'Josh', 'Angel', 'Antigravity', 'Domi', 'Cleo'\]/g, "allowedVoices: ['Lyra', 'Maya', 'John', 'Rachel', 'Antoni', 'Bella', 'Josh', 'Angel', 'Antigravity', 'Domi', 'Cleo']");
  content = content.replace(/allowedVoices: \['Lyra', 'John', 'Rachel', 'Antoni', 'Bella', 'Josh', 'Angel', 'Antigravity', 'Domi', 'Cleo', 'Ivy', 'Nova'\]/g, "allowedVoices: ['Lyra', 'Maya', 'John', 'Rachel', 'Antoni', 'Bella', 'Josh', 'Angel', 'Antigravity', 'Domi', 'Cleo', 'Ivy', 'Nova']");

  // In tts.ts specifically, add fallbacks
  if (f.endsWith('tts.ts')) {
    // Add voice-maya to mappings
    content = content.replace(/'voice-lyra': 'shimmer',/g, "'voice-lyra': 'shimmer',\n    'voice-maya': 'shimmer',");
    content = content.replace(/'voice-lyra': 'cgSgspJ2msm6clMCkdW9',/g, "'voice-lyra': 'cgSgspJ2msm6clMCkdW9',\n    'voice-maya': 'cgSgspJ2msm6clMCkdW9',");
    
    // Add Maya to TIER_VOICES
    content = content.replace(/'voice-lyra', 'voice-john'/g, "'voice-lyra', 'voice-maya', 'voice-john'");
    
    // Fix the HF logic to use sesame-maya
    content = content.replace(/voice === 'sesame-lyra-csm-1b'/g, "voice === 'sesame-maya-csm-1b'");
    content = content.replace(/models\/sesame\/csm-1b/g, "models/sesame/csm-1b"); // ensure correct
  }

  // Final catch-all for any missed "sesame-lyra"
  content = content.replace(/sesame-lyra/g, 'sesame-maya');

  fs.writeFileSync(f, content);
  console.log(`Updated ${f}`);
});
