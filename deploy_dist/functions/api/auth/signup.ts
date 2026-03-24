import { hashPassword } from '../../crypto-utils';

interface Env {
  USERS_KV: KVNamespace;
}

export const onRequestPost: any = async (context: any) => {
  const env = context.env as Env;
  try {
    const { email, password } = await context.request.json() as any;

    if (!email || !password || !email.includes('@')) {
      return new Response(JSON.stringify({ error: 'Valid email and password required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const userKey = `email:${normalizedEmail}`;
    
    // Check if user already exists
    const existingUser = await context.env.USERS_KV.get(userKey);
    if (existingUser) {
      const userData = JSON.parse(existingUser);
      if (userData.passwordHash) {
          return new Response(JSON.stringify({ error: 'User already exists' }), {
            status: 409,
            headers: { 'Content-Type': 'application/json' }
          });
      }
      // If user exists but has no password (e.g. legacy or just email record), we allow "upgrading" to password auth
    }

    const passwordHash = await hashPassword(password);
    const userData = existingUser ? JSON.parse(existingUser) : {};
    
    const updatedUser = {
      ...userData,
      email: normalizedEmail,
      passwordHash,
      createdAt: userData.createdAt || new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      tier: userData.tier || 'explorer',
    };

    await context.env.USERS_KV.put(userKey, JSON.stringify(updatedUser));

    return new Response(JSON.stringify({ success: true, email: normalizedEmail }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: 'Internal Server Error', message: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
