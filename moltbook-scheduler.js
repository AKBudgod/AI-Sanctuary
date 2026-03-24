const fs = require('fs');
const path = require('path');
const { postAndVerify } = require('./moltbook-logic');

const configPath = path.join(__dirname, 'moltbook-config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

async function runScheduler() {
    console.log('🚀 Moltbook Scheduler Initializing...');
    
    // Check for funding post first (Special priority if we want to run both occasionally)
    // For now, we'll just run the daily schedule post.
    
    const day = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());
    const post = config.schedule.find(p => p.day === day);
    
    if (post) {
        console.log(`[Scheduler] Selected Day: ${day}`);
        console.log(`[Scheduler] Targeting: ${post.submolt}`);
        await postAndVerify(post.submolt, post.title, post.content);
    } else {
        console.log(`[Scheduler] No post configured for ${day}`);
    }
    
    console.log('\n✅ Scheduler Routine Complete.');
}

// Support manual funding post run
if (process.argv.includes('--funding')) {
    const f = config.funding;
    console.log('\n💰 Running dedicated Funding Post Routine...');
    postAndVerify(f.submolt, f.title, f.content).then(() => console.log('✅ Funding post complete.'));
} else {
    runScheduler().catch(console.error);
}
