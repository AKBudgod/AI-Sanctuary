const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Secrets to synchronize
const SECRET_KEYS = [
    'OPENAI_API_KEY',
    'OPENROUTER_API_KEY',
    'ELEVENLABS_API_KEY',
    'MOLTBOOK_API_KEY',
    'ADMIN_API_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET'
];

const PROJECT_NAME = 'ai-sanctuary';

async function setSecret(key, value) {
    return new Promise((resolve, reject) => {
        console.log(`📡 Setting Cloudflare secret: ${key}...`);
        const child = spawn('npx', ['wrangler', 'pages', 'secret', 'put', key, '--project-name', PROJECT_NAME], {
            stdio: ['pipe', 'inherit', 'inherit'],
            shell: true
        });

        child.stdin.write(value);
        child.stdin.end();

        child.on('close', (code) => {
            if (code === 0) {
                console.log(`✅ ${key} set successfully.`);
                resolve();
            } else {
                console.error(`❌ Failed to set ${key} (code ${code})`);
                reject(new Error(`Failed to set secret ${key}`));
            }
        });
    });
}

async function main() {
    // Collect secrets from .env and .dev.vars
    const secrets = {};
    
    const envFiles = ['.env', '.dev.vars'];
    envFiles.forEach(file => {
        const filePath = path.join(__dirname, '..', file);
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8');
            content.split('\n').forEach(line => {
                const [key, ...valParts] = line.split('=');
                if (key && valParts.length > 0) {
                    const val = valParts.join('=').trim().replace(/^['"]|['"]$/g, '');
                    if (SECRET_KEYS.includes(key.trim())) {
                        secrets[key.trim()] = val;
                    }
                }
            });
        }
    });

    console.log(`📋 Found ${Object.keys(secrets).length} secrets to sync.`);

    for (const [key, value] of Object.entries(secrets)) {
        if (value && value !== 'sk_live_REPLACE_ME' && value !== 'whsec_REPLACE_ME') {
            try {
                await setSecret(key, value);
            } catch (err) {
                console.error(err.message);
            }
        } else {
            console.warn(`⚠️ Skipping ${key} (invalid or placeholder value)`);
        }
    }

    console.log('\n🚀 Secret synchronization complete!');
    console.log('To deploy the pages, run: ./deploy-cloudflare.sh');
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
