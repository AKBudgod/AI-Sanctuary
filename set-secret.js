const { spawn } = require('child_process');
const child = spawn('npx', ['wrangler', 'pages', 'secret', 'put', 'OPENROUTER_API_KEY', '--project-name', 'ai-sanctuary'], { 
    stdio: ['pipe', 'inherit', 'inherit'],
    shell: true
});
child.stdin.write('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');
child.stdin.end();
