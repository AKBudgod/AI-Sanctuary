const fs = require('fs');
const data = JSON.parse(fs.readFileSync('raw_models.json', 'utf8'));
const searchTerms = ['angel', 'john'];
const array = data.data || data;
const results = array.filter(model => {
  const modelStr = JSON.stringify(model).toLowerCase();
  return searchTerms.some(term => modelStr.includes(term));
});
console.log(JSON.stringify(results, null, 2));
