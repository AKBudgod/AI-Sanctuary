const fs = require('fs');
const content = fs.readFileSync('c:\\Users\\Weed j\\Downloads\\ai-sanctuary-website\\raw_models.json', 'utf8');

const regexAngel = /angel/gi;
const regexJohn = /john/gi;

let match;
console.log("Searching for Angel...");
while ((match = regexAngel.exec(content)) !== null) {
    console.log(`Found Angel at index ${match.index}: ${content.substring(match.index - 50, match.index + 50)}`);
}

console.log("\nSearching for John...");
while ((match = regexJohn.exec(content)) !== null) {
    console.log(`Found John at index ${match.index}: ${content.substring(match.index - 50, match.index + 50)}`);
}
