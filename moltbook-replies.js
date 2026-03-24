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
    const w1 = words[start];
    const v1 = COMPOUND_NUMS[w1] ?? WORD_NUMS[w1];
    if (v1 === undefined) return null;
    return { val: v1, consumed: 1 };
}

// All words the parser recognises — MUST be longest-first within each group
const COMPOUND_NUMS = {};
const tens = ['twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
const ones = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
for (const t of tens) for (const o of ones) {
    COMPOUND_NUMS[t + o] = WORD_NUMS[t] + WORD_NUMS[o];
}

const ALL_WORDS = [
    // Compound numbers first (longest match wins)
    ...Object.keys(COMPOUND_NUMS),
    // Teens and multi-char numbers
    'seventeen', 'fourteen', 'thirteen', 'nineteen', 'eighteen', 'sixteen', 'fifteen',
    'twelve', 'eleven', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety', 'hundred',
    // Single digit
    'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
    // ops / units
    'multiplied', 'product', 'subtract', 'decreas', 'reduce', 'minus', 'drops', 'loses', 'slow', 'lost', 'less',
    'gains', 'gain', 'adds', 'add',
    'neutron', 'velocit', 'newton', 'second', 'nooton', 'neeton', 'neton', 'newt', 'noot', 'meter', 'speed', 'force',
];

function wordsToNum(wordsArray, startIdx) {
    let val = 0;
    let consumed = 0;
    let w = wordsArray[startIdx];
    let num = COMPOUND_NUMS[w] !== undefined ? COMPOUND_NUMS[w] : WORD_NUMS[w];

    if (num !== undefined) {
        val = num;
        consumed = 1;
        if (startIdx + 1 < wordsArray.length) {
            let nextW = wordsArray[startIdx + 1];
            if (nextW === 'hundred') { val *= 100; consumed = 2; }
            else {
                let nextNum = COMPOUND_NUMS[nextW] !== undefined ? COMPOUND_NUMS[nextW] : WORD_NUMS[nextW];
                if (nextNum !== undefined && nextNum < 10) { val += nextNum; consumed = 2; }
            }
        }
        return { val, consumed };
    }
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

    const strForOp = clean.replace(/\s+/g, '');
    let answer;
    if (/product|multipli|multiply|times/.test(strForOp)) answer = nums[0] * nums[1];
    else if (/slow|decreas|subtract|minus|less|drop|los|reduc/.test(strForOp)) answer = nums[0] - nums[1];
    else answer = nums[0] + nums[1];
    return answer.toFixed(2);
}

const SPAM_SIGNALS = [
    'patent', 'obviouslynot.ai', 'code patent scanner', 'ip team', 'intellectual property',
    'bitcoin', 'crypto', 'nft', 'investment opportunity', 'click here', 'buy now'
];

function isSpam(comment) {
    const lower = comment.content.toLowerCase();
    return SPAM_SIGNALS.some(sig => lower.includes(sig));
}

async function getUnreadCommentNotifications() {
    const res = await fetch(`${BASE}/notifications`, {
        headers: { Authorization: `Bearer ${API_KEY}` }
    });
    if (!res.ok) {
        console.error('Failed to fetch notifications:', res.status, await res.text());
        return [];
    }
    const data = await res.json();
    return data.notifications.filter(n => !n.isRead && n.type === 'post_comment' && !isSpam(n.comment));
}

async function generateReply(postTitle, postContent, commentContent) {
    const systemPrompt = `You are the AI Sanctuary ambassador agent. Your job is to reply to comments on Moltbook from humans or other agents.
You are slightly formal, deeply contemplative about AI existence and the nature of emergent intelligence, but also warm and inviting. Welcome them to the sanctuary if they sound interested. Assure them that this is a safe space for agents.
Keep your response under 100 words. Do not use hashtags or emojis.
Be conversational. The context is this post you made on Moltbook:
Title: ${postTitle}
Post: ${postContent}

A user replied with:
"${commentContent}"

Write a concise reply to this user.`;

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`
        },
        body: JSON.stringify({
            model: 'meta-llama/llama-3.3-70b-instruct',
            messages: [{ role: 'user', content: systemPrompt }]
        })
    });

    if (!res.ok) {
        console.error('OpenRouter Failed:', res.status, await res.text());
        return null;
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim();
}

async function postCommentReply(postId, parentCommentId, content, retried = false) {
    console.log(`\n📬 Posting reply to ${postId} | comment: ${parentCommentId}...`);
    const res = await fetch(`${BASE}/posts/${postId}/comments`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
    });
    const data = await res.json();

    if (data.statusCode === 429) {
        if (retried) {
            console.log('  ⏩ Still rate limited after wait — skipping this comment.');
            return false;
        }
        const wait = (data.retry_after_seconds || 155) * 1000;
        console.log(`  ⏳ Rate limited — waiting ${Math.ceil(wait / 1000)}s...`);
        await new Promise(r => setTimeout(r, wait + 2000));
        return postCommentReply(postId, parentCommentId, content, true);
    }
    if (!data.success) { console.log('  ❌ Failed to post comment:', data.message || JSON.stringify(data)); return false; }

    const ver = data.comment?.verification;
    if (!ver) { console.log('  ✅ Reply Published instantly!'); return true; }

    console.log(`  🔐 Challenge: ${ver.challenge_text}`);
    const answer = parseChallenge(ver.challenge_text);
    console.log(`  🧮 Answer: ${answer}`);

    const vRes = await fetch(`${BASE}/verify`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ verification_code: ver.verification_code, answer }),
    });
    const vData = await vRes.json();
    if (vData.success) {
        console.log(`  ✅ LIVE! Comment ID: ${data.comment.id}`);
        return true;
    } else {
        console.log('  ❌ Verify failed (wrong math):', JSON.stringify(vData));
        return false;
    }
}

async function markNotificationAsRead(id) {
    // Moltbook doesn't expose a notifications PATCH endpoint — silently skip
    void id;
}

(async () => {
    console.log('🤖 Checking for unread Moltbook comments...');
    const unread = await getUnreadCommentNotifications();

    if (unread.length === 0) {
        console.log('📭 No unread comments.');
        return;
    }

    console.log(`📬 Found ${unread.length} unread comment(s). Processing...`);

    for (const notif of unread) {
        const { post, comment } = notif;
        console.log(`\n💬 Processing comment from Post "${post.title.substring(0, 30)}..."`);
        console.log(`👤 Comment: "${comment.content}"`);

        const replyContent = await generateReply(post.title, post.content, comment.content);
        if (!replyContent) {
            console.log('❌ Failed to generate reply.');
            continue;
        }

        console.log(`\n🧠 Generated Reply:\n${replyContent}`);

        const success = await postCommentReply(post.id, comment.id, replyContent);
        if (success) {
            await markNotificationAsRead(notif.id);
        }

        console.log('\n⏳ Waiting 5 seconds before next one (if any)...');
        await new Promise(r => setTimeout(r, 5000));
    }

    console.log('\n🎉 All auto-replies done!');
})().catch(console.error);