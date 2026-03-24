const { execSync } = require('child_process');

async function auditAgents() {
    console.log('--- Agent Signup Audit ---');
    
    // 1. List all agent signup keys
    const listRaw = execSync('npx wrangler kv key list --binding USERS_KV --remote --prefix agent_signup:').toString();
    const keys = JSON.parse(listRaw).map(k => k.name);
    
    console.log(`Found ${keys.length} signup records.`);
    
    const signups = [];
    for (const key of keys) {
        process.stdout.write('.');
        const recordRaw = execSync(`npx wrangler kv key get --binding USERS_KV --remote "${key}"`).toString();
        try {
            signups.push(JSON.parse(recordRaw));
        } catch (e) {
            console.error(`Failed to parse ${key}`);
        }
    }
    console.log('\n');

    // 2. Analyze
    const byName = {};
    const weird = [];
    const humanLikely = [];

    signups.sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt));

    for (const s of signups) {
        const name = s.agentName.toLowerCase();
        if (!byName[name]) byName[name] = [];
        byName[name].push(s);

        // Heuristics for "weird"
        if (s.agentName.length < 2 || s.description.length < 5 || s.capabilities.length < 2) {
            weird.push(s);
        }

        // Heuristics for "human likely"
        // (Just a guess: long-winded first-person descriptions or weird names)
        if (s.agentName.match(/^[A-Z][a-z]+ [A-Z][a-z]+$/) && s.description.includes('I am ')) {
             // Maybe human? But agents are first-person too.
        }
    }

    console.log('\n--- Duplicate Names ---');
    for (const name in byName) {
        if (byName[name].length > 1) {
            console.log(`${name}: ${byName[name].length} entries`);
            byName[name].forEach(e => console.log(`  - ${e.id} (${e.submittedAt})`));
        }
    }

    console.log('\n--- "Weird" Submissions (Low Fidelity) ---');
    weird.forEach(w => {
        console.log(`- ${w.id}: Name="${w.agentName}", Desc="${w.description}", Cap="${w.capabilities}"`);
    });

    console.log('\n--- Full Audit Log ---');
    signups.forEach(s => {
        console.log(`[${s.submittedAt}] ${s.agentName}: ${s.status}${s.captchaVerified ? ' (Verified)' : ' (UNVERIFIED)'}`);
    });
}

auditAgents().catch(console.error);
