const fs = require('fs');
const data = JSON.parse(fs.readFileSync('c:\\Users\\Weed j\\Downloads\\ai-sanctuary-website\\raw_models.json', 'utf8'));

const results = data.data.filter(m => 
    m.name.toLowerCase().includes('angel') || 
    m.id.toLowerCase().includes('angel') ||
    m.description.toLowerCase().includes('angel') ||
    m.name.toLowerCase().includes('john') || 
    m.id.toLowerCase().includes('john') ||
    m.description.toLowerCase().includes('john')
);

console.log(JSON.stringify(results, null, 2));
