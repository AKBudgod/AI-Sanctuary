import Stripe from 'stripe';

// Manually defining Types if not available
interface EventContext<Env, Params extends string, Data> {
    request: Request;
    functionPath: string;
    waitUntil: (promise: Promise<any>) => void;
    next: (input?: Request | string, init?: RequestInit) => Promise<Response>;
    env: Env;
    params: Params;
    data: Data;
}

type PagesFunction<
    Env = any,
    Params extends string = any,
    Data extends Record<string, unknown> = Record<string, unknown>
> = (context: EventContext<Env, Params, Data>) => Response | Promise<Response>;

export const onRequestPost: PagesFunction = async (context) => {
    const { request, env } = context;

    const stripeSecret = env.STRIPE_SECRET_KEY as string;
    if (!stripeSecret) {
        return new Response(JSON.stringify({ error: 'Stripe not configured (STRIPE_SECRET_KEY missing)' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const stripe = new Stripe(stripeSecret, {
        apiVersion: '2023-10-16' as any,
    });

    try {
        const { email, usd, tier, mode, interval } = await request.json() as { email: string; usd: any; tier?: string; mode?: string, interval?: 'month' | 'year' };

        if (!email || !email.includes('@')) {
            return new Response(JSON.stringify({ error: 'valid email required' }), { status: 400 });
        }

        const origin = new URL(request.url).origin;

        // Identity Verification Session
        if (mode === 'verification') {
            const verificationSession = await stripe.identity.verificationSessions.create({
                type: 'document',
                metadata: {
                    userEmail: email.toLowerCase(),
                },
                return_url: `${origin}/platform?verification_submitted=true`,
            });

            return new Response(JSON.stringify({
                client_secret: verificationSession.client_secret,
                url: verificationSession.url
            }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Developer Mode purchase
        if (tier === 'developer') {
            let priceCents = 5000; // Default $50 one-time (legacy fallback, though logic below overrides)
            let paymentMode: Stripe.Checkout.Session.Mode = 'payment';
            let recurring: any = undefined;
            let productName = 'Developer Mode Access';

            if (interval === 'month') {
                priceCents = 2000; // $20/mo
                paymentMode = 'subscription';
                recurring = { interval: 'month' };
                productName = 'Developer Mode (Monthly)';
            } else if (interval === 'year') {
                priceCents = 5000; // $50/yr
                paymentMode = 'subscription';
                recurring = { interval: 'year' };
                productName = 'Developer Mode (Yearly)';
            } else if (interval === 'lifetime') {
                priceCents = 10000; // $100 lifetime
                paymentMode = 'payment';
                recurring = undefined;
                productName = 'Developer Mode (Lifetime)';
            } else {
                // Fallback to one-time if no interval specified
                priceCents = 5000;
                paymentMode = 'payment';
                recurring = undefined;
            }

            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                mode: paymentMode,
                line_items: [
                    {
                        price_data: {
                            currency: 'usd',
                            product_data: {
                                name: productName,
                                description: `Unlimited AI access for ${email}. Includes 100,000 SANC tokens.`,
                            },
                            unit_amount: priceCents,
                            recurring: recurring,
                        },
                        quantity: 1,
                    },
                ],
                customer_email: email,
                metadata: {
                    userEmail: email.toLowerCase(),
                    tokens: '100000',
                    tier: 'developer',
                    source: 'sanc_developer_mode',
                    subscription: paymentMode === 'subscription' ? 'true' : 'false',
                    interval: interval || 'one-time',
                },
                success_url: `${origin}/platform?payment_success=true&tier=developer`,
                cancel_url: `${origin}/buy?canceled=true`,
            });

            return new Response(JSON.stringify({ id: session.id }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Regular token purchase
        if (!usd) {
            return new Response(JSON.stringify({ error: 'usd amount required' }), { status: 400 });
        }

        const usdAmount = Number(usd);
        if (Number.isNaN(usdAmount) || usdAmount <= 0) {
            return new Response(JSON.stringify({ error: 'invalid usd amount' }), { status: 400 });
        }

        // 1 USD => 1000 SANC
        const tokens = Math.floor(usdAmount * 1000);
        const amountCents = Math.round(usdAmount * 100);

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: { name: 'SANC Tokens', description: `${tokens.toLocaleString()} SANC (Credit to: ${email})` },
                        unit_amount: amountCents,
                    },
                    quantity: 1,
                },
            ],
            customer_email: email,
            metadata: {
                userEmail: email.toLowerCase(),
                tokens: String(tokens),
                source: 'sanc_purchase',
            },
            success_url: `${origin}/platform?payment_success=true&tokens=${tokens}`,
            cancel_url: `${origin}/buy?canceled=true`,
        });

        return new Response(JSON.stringify({ id: session.id }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (err: any) {
        // Sanitize error - never expose API keys to frontend
        let safeMessage = 'Payment processing error. Please try again.';
        const msg = err.message || String(err);
        if (msg.includes('Invalid API Key')) {
            safeMessage = 'Payment system configuration error. Please contact support.';
        } else if (msg.includes('No such') || msg.includes('resource_missing')) {
            safeMessage = 'Payment configuration error. Please contact support.';
        } else if (!msg.includes('sk_') && !msg.includes('pk_') && !msg.includes('key')) {
            // Only pass through messages that definitely don't contain keys
            safeMessage = msg;
        }
        return new Response(JSON.stringify({ error: safeMessage }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
