import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const BALANCES_FILE = path.join(DATA_DIR, 'balances.json');
const PURCHASES_FILE = path.join(DATA_DIR, 'purchases.json');

function safeRead(file: string) {
    try {
        const raw = fs.readFileSync(file, 'utf8');
        return JSON.parse(raw || '{}');
    } catch (e) {
        return file.endsWith('json') ? (file === PURCHASES_FILE ? [] : {}) : {};
    }
}

function safeWrite(file: string, data: any) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

export function getBalance(address: string): number {
    const balances = safeRead(BALANCES_FILE);
    const key = address.toLowerCase();
    return Number(balances[key] || 0);
}

export function creditBalance(address: string, amountTokens: number) {
    const balances = safeRead(BALANCES_FILE);
    const key = address.toLowerCase();
    balances[key] = (Number(balances[key] || 0) + Number(amountTokens));
    safeWrite(BALANCES_FILE, balances);
    return balances[key];
}

export function debitBalance(address: string, amountTokens: number) {
    const balances = safeRead(BALANCES_FILE);
    const key = address.toLowerCase();
    const current = Number(balances[key] || 0);
    const deduct = Number(amountTokens);
    const next = Math.max(0, current - deduct);
    balances[key] = next;
    safeWrite(BALANCES_FILE, balances);
    return balances[key];
}

export function recordPurchase(purchase: any) {
    const purchases = safeRead(PURCHASES_FILE) || [];
    purchases.push({ ...purchase, timestamp: new Date().toISOString() });
    safeWrite(PURCHASES_FILE, purchases);
    return purchase;
}

export function getPurchases() {
    return safeRead(PURCHASES_FILE) || [];
}

// Stripe event idempotency helpers
const STRIPE_EVENTS_FILE = path.join(DATA_DIR, 'stripe_events.json');

export function hasProcessedEvent(eventId: string) {
    const events = safeRead(STRIPE_EVENTS_FILE);
    const list = Array.isArray(events) ? events : [];
    return list.includes(eventId);
}

export function markEventProcessed(eventId: string) {
    const events = safeRead(STRIPE_EVENTS_FILE);
    const list = Array.isArray(events) ? events : [];
    if (!list.includes(eventId)) {
        list.push(eventId);
        safeWrite(STRIPE_EVENTS_FILE, list);
    }
}

