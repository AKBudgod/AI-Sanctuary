const fs = require('fs');

const files = [
    'functions/api/models.ts',
    'functions/api/tiers.ts',
    'src/lib/tiers.ts'
];

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    // Replace 'google/gemma-3-12b-it:free' with 'openai/gpt-4o-mini'
    // ONLY for block definitions that start with `type: 'Voice'`

    // A simple hacky regex that replaces the very next occurrence of the string after type: 'Voice'
    // Or we just string split
    const parts = content.split("type: 'Voice'");
    for (let i = 1; i < parts.length; i++) {
        parts[i] = parts[i].replace('google/gemma-3-12b-it:free', 'openai/gpt-4o-mini');
    }

    fs.writeFileSync(file, parts.join("type: 'Voice'"));
    console.log('Updated ' + file);
});
