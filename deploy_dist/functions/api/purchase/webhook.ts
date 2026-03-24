import Stripe from 'stripe';

type PagesFunction<
    Env = any,
    Params extends string = any,
    Data extends Record<string, unknown> = Record<string, unknown>
> = (context: { request: Request; env: Env; params: Params; data: Data; waitUntil: (p: Promise<any>) => void; next: (input?: Request | string, init?: RequestInit) => Promise<Response>; functionPath: string }) => Response | Promise<Response>;

export const onRequestPost: PagesFunction = async (context) => {
    const { request, env } = context;
    const stripeSecret = env.STRIPE_SECRET_KEY as string;
    const endpointSecret = env.STRIPE_WEBHOOK_SECRET as string;

    if (!stripeSecret || !endpointSecret) {
        return new Response('Stripe config missing', { status: 500 });
    }

    const sig = request.headers.get('stripe-signature');
    if (!sig) return new Response('No signature', { status: 400 });

    const body = await request.text();
    const stripe = new Stripe(stripeSecret, { apiVersion: '2023-10-16' as any });

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    } catch (err: any) {
        return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    // Handle payment success
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;

        // Extract metadata
        const userEmail = session.metadata?.userEmail;
        const tokensStr = session.metadata?.tokens;
        const purchasedTier = session.metadata?.tier; // e.g. 'developer'
        const subscriptionId = session.subscription as string;

        if (userEmail) {
            try {
                // Use email: prefix to match models.ts KV lookups
                const userKey = `email:${userEmail.toLowerCase()}`;
                let userData: any = await env.USERS_KV.get(userKey, { type: 'json' });

                if (!userData) {
                    userData = {
                        email: userEmail,
                        tokens: 0,
                        tier: 'explorer',
                        firstConnected: new Date().toISOString(),
                        isDeveloper: false,
                    };
                }

                // Credit tokens if applicable
                if (tokensStr) {
                    const tokens = parseInt(tokensStr, 10);
                    userData.tokens = (userData.tokens || 0) + tokens;
                    console.log(`Credited ${tokens} SANC to ${userEmail}. New balance: ${userData.tokens}`);
                }

                // Upgrade tier if Developer Mode was purchased
                if (purchasedTier === 'developer') {
                    userData.tier = 'developer';
                    userData.isDeveloper = true;
                    
                    if (session.metadata?.interval === 'lifetime') {
                        userData.isLifetime = true;
                    }

                    if (subscriptionId) {
                        userData.subscriptionId = subscriptionId;
                        userData.subscriptionStatus = 'active';
                    }
                    console.log(`Upgraded ${userEmail} to Developer Mode (${session.metadata?.interval || 'one-time'})`);
                }

                // Save updated user data
                await env.USERS_KV.put(userKey, JSON.stringify(userData));

            } catch (kvError) {
                console.error('KV Error crediting tokens:', kvError);
                return new Response('Database Error', { status: 500 });
            }
        }
    }

    // Handle Subscription Cancellation
    if (event.type === 'customer.subscription.deleted') {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('Subscription deleted:', subscription.id);
        // Note: Automated downgrade requires finding user by subscription ID or Customer ID.
        // Current KV schema is checking only by email.
        // We log this for admin manual review or future implementation using a secondary index.
    }

    // Handle Identity Verification success
    if (event.type === 'identity.verification_session.verified') {
        const session = event.data.object as any;
        const userEmail = session.metadata?.userEmail;

        if (userEmail) {
            try {
                const userKey = `email:${userEmail.toLowerCase()}`;
                let userData: any = await env.USERS_KV.get(userKey, { type: 'json' });

                if (!userData) {
                    userData = {
                        email: userEmail,
                        tier: 'explorer',
                        firstConnected: new Date().toISOString(),
                    };
                }

                userData.isVerified = true;
                userData.verificationDate = new Date().toISOString();

                await env.USERS_KV.put(userKey, JSON.stringify(userData));
                console.log(`Verified age for ${userEmail}`);

            } catch (err) {
                console.error('KV Error verifying user:', err);
                return new Response('Database Error', { status: 500 });
            }
        }
    }

    return new Response(JSON.stringify({ received: true }), {
        headers: { 'Content-Type': 'application/json' }
    });
};
