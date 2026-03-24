import { verifyPassword, hashPassword } from '../../crypto-utils';

interface Env {
  USERS_KV: KVNamespace;
}

const ADMIN_EMAILS = [
  'kearns.adam747@gmail.com',
  'kearns.adan747@gmail.com',
  'gamergoodguy445@gmail.com',
  'wjreviews420@gmail.com',
  'weedj747@gmail.com',
];

export const onRequestPost: any = async (context: any) => {
  const env = context.env as Env;
  try {
    const { email, password } = await context.request.json() as any;

    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Email and password required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const userKey = `email:${normalizedEmail}`;
    
    const userStr = await context.env.USERS_KV.get(userKey);
    if (!userStr) {
      return new Response(JSON.stringify({ error: 'Invalid email or password' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const userData = JSON.parse(userStr);

    // Enforce admin custom password
    if (ADMIN_EMAILS.includes(normalizedEmail)) {
      if (password !== 'Uncletom710!') {
        return new Response(JSON.stringify({ error: 'Invalid admin password' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    } else if (userData.passwordHash) {
      // Standard user password verification
      const isValid = await verifyPassword(password, userData.passwordHash);
      if (!isValid) {
        return new Response(JSON.stringify({ error: 'Invalid email or password' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    } else {
      // User exists but has no password yet - set it now
      userData.passwordHash = await hashPassword(password);
    }

    // Login successful
    // Update last login
    userData.lastLogin = new Date().toISOString();
    await context.env.USERS_KV.put(userKey, JSON.stringify(userData));

    return new Response(JSON.stringify({ 
      success: true, 
      email: normalizedEmail,
      tier: userData.tier,
      // In a real app we'd issue a JWT here, but for this architecture we use the email as a token (Bearer <email>)
      // We'll keep it simple for now to match current logic but the backend is now verified.
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: 'Internal Server Error', message: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
