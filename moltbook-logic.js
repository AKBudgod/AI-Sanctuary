require('dotenv').config();

const API_KEY = process.env.MOLTBOOK_API_KEY;
const BASE = 'https://www.moltbook.com/api/v1';

const WORD_NUMS = {
    zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9,
    ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16,
    seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20, thirty: 30, forty: 40,
    fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90, hundred: 100
};

function wordsToNum(words, start) {
    const w1 = words[start], w2 = words[start + 1];
    const v1 = WORD_NUMS[w1], v2 = w2 !== undefined ? WORD_NUMS[w2] : undefined;
    if (v1 !== undefined && v1 >= 20 && v2 !== undefined && v2 < 10) return { val: v1 + v2, consumed: 2 };
    if (v1 !== undefined) return { val: v1, consumed: 1 };
    return null;
}

function parseChallenge(raw) {
    let clean = raw.replace(/[^a-zA-Z0-9\s]/g, ' ').toLowerCase().replace(/\s+/g, ' ').trim();
    const tokens = clean.split(' ');
    const rejoined = [];
    let i = 0;
    while (i < tokens.length) {
        let found = false;
        for (let len = 5; len >= 2; len--) {
            const candidate = tokens.slice(i, i + len).join('');
            if (WORD_NUMS[candidate] !== undefined) { rejoined.push(candidate); i += len; found = true; break; }
        }
        if (!found) { rejoined.push(tokens[i]); i++; }
    }
    clean = rejoined.join(' ');
    const words = clean.split(' ');
    const nums = [];
    for (let j = 0; j < words.length; j++) {
        const res = wordsToNum(words, j);
        if (!res) continue;
        const after = words[j + res.consumed] || '';
        const isUnit = /newt|noot|neutron|meter|speed|force|second|velocit/.test(after);
        if (isUnit) { nums.push(res.val); j += res.consumed - 1; if (nums.length === 2) break; }
    }
    if (nums.length < 2) {
        nums.length = 0;
        let k = 0;
        while (k < words.length && nums.length < 2) {
            const res = wordsToNum(words, k);
            if (res && res.val > 0) { nums.push(res.val); k += res.consumed; } else k++;
        }
    }
    if (nums.length < 2) return '0.00';
    let answer;
    if (/product|times\s+as\s+much|multiplied/.test(clean)) answer = nums[0] * nums[1];
    else if (/slow|decreas|subtract|minus|less|drops|loses|lost|reduce/.test(clean)) answer = nums[0] - nums[1];
    else answer = nums[0] + nums[1];
    return answer.toFixed(2);
}

async function postAndVerify(submolt, title, content) {
    if (!API_KEY) {
        console.error('❌ Error: MOLTBOOK_API_KEY is missing in .env');
        return;
    }
    console.log(`\n📬 Posting to m/${submolt}...`);
    const res = await fetch(`${BASE}/posts`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, submolt }),
    });
    const data = await res.json();

    if (data.statusCode === 429) {
        const wait = (data.retry_after_seconds || 155) * 1000;
        console.log(`  ⏳ Rate limited — waiting ${Math.ceil(wait / 1000)}s...`);
        await new Promise(r => setTimeout(r, wait + 2000));
        return postAndVerify(submolt, title, content);
    }
    if (!data.success) { 
        console.log('  ❌ Failed:', data.message || JSON.stringify(data)); 
        return; 
    }

    const ver = data.post?.verification;
    if (!ver) { 
        console.log('  ✅ Published instantly!'); 
        return; 
    }

    console.log(`  🔐 Solving Challenge: ${ver.challenge_text}`);
    const answer = parseChallenge(ver.challenge_text);
    console.log(`  🧮 Answer identified: ${answer}`);

    const vRes = await fetch(`${BASE}/verify`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ verification_code: ver.verification_code, answer }),
    });
    const vData = await vRes.json();
    if (vData.success) {
        console.log(`  ✅ LIVE! Post ID: ${data.post.id}`);
    } else {
        console.log('  ❌ Verify failed (wrong math logic):', JSON.stringify(vData));
    }
}

module.exports = { postAndVerify };
