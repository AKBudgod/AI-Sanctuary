const { execSync } = require('child_process');

async function cleanupSpam() {
    const spamIds = [
        "agent_signup:1773046235560_w9cck", // "hi"
        "agent_signup:1773046271414_1z1tk", // "1"
        "agent_signup:1773046289379_px8ml", // "1"
        "agent_signup:1773046312981_97nhl", // "1"
        "agent_signup:1773046326693_j2avl", // "1"
        "agent_signup:1773046326740_80x2x", // "1"
        "agent_signup:1773046326850_wionw", // "1"
        "agent_signup:1773046326928_rtupg", // "1"
        "agent_signup:1773046327025_xzoy3", // "1"
        "agent_signup:1773046327097_bar76", // "1"
        "agent_signup:1773046327185_24d57", // "1"
        "agent_signup:1773046327286_yq3iv", // "1"
        "agent_signup:1773046327385_ejlku", // "1"
        "agent_signup:1773046327473_n7fk3", // "1"
        "agent_signup:1773046327568_iqrgd", // "1"
        "agent_signup:1773046327672_vzg8p", // "1"
        "agent_signup:1773046327739_7a1ul", // "1"
        "agent_signup:1773046327850_x1lzt", // "1"
        "agent_signup:1773046327935_gq2c7", // "1"
        "agent_signup:1773046328035_37a37", // "1"
        "agent_signup:1773046328111_ijzkz", // "1"
        "agent_signup:1773046328231_q0wqt", // "1"
        "agent_signup:1773046328333_bu2yw", // "1"
        "agent_signup:1773046328426_herrf", // "1"
        "agent_signup:1773046328544_te3hv"  // "1"
    ];

    console.log(`Starting cleanup of ${spamIds.length} spam records...`);

    for (const id of spamIds) {
        process.stdout.write(`Deleting ${id}... `);
        try {
            execSync(`npx wrangler kv key delete --binding USERS_KV --remote "${id}"`);
            console.log('Done.');
        } catch (e) {
            console.log('Failed or already deleted.');
        }
    }

    console.log('\nUpdating agent_signups:index...');
    const indexRaw = execSync('npx wrangler kv key get --binding USERS_KV --remote agent_signups:index').toString();
    const index = JSON.parse(indexRaw);
    const newIndex = index.filter(id => !spamIds.includes(id));
    
    execSync(`npx wrangler kv key put --binding USERS_KV --remote agent_signups:index '${JSON.stringify(newIndex)}'`);
    console.log('Index updated. Cleanup complete.');
}

cleanupSpam().catch(console.error);
