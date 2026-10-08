import crypto from 'crypto';

/**
 * Admin password exclusively retrieved from environment variable process.env.ADMIN_PASSWORD
 * Defaults to 'socorro' if env is not defined
 */
export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD ? process.env.ADMIN_PASSWORD.trim() : 'socorro';
}

const SERVER_SECRET = process.env.AUTH_SECRET || 'socorro-secret-session-salt-2026';

/**
 * Generates an encrypted session token for authenticated admin
 */
export function generateAdminToken(): string {
  const payload = JSON.stringify({
    role: 'admin',
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
    nonce: crypto.randomBytes(8).toString('hex'),
  });
  const hmac = crypto.createHmac('sha256', SERVER_SECRET).update(payload).digest('hex');
  return Buffer.from(`${payload}.${hmac}`).toString('base64');
}

/**
 * Validates the admin session token
 */
export function verifyAdminToken(token: string): boolean {
  if (!token) return false;
  try {
    const raw = Buffer.from(token, 'base64').toString('utf-8');
    const [payloadStr, signature] = raw.split('.');
    if (!payloadStr || !signature) return false;

    const expectedHmac = crypto.createHmac('sha256', SERVER_SECRET).update(payloadStr).digest('hex');
    if (signature !== expectedHmac) return false;

    const payload = JSON.parse(payloadStr);
    if (payload.role !== 'admin') return false;
    if (payload.exp && Date.now() > payload.exp) return false;

    return true;
  } catch {
    return false;
  }
}

/**
 * Verifies if user-supplied password matches process.env.ADMIN_PASSWORD
 */
export function verifyPassword(inputPassword?: string): boolean {
  if (!inputPassword) return false;
  const target = getAdminPassword();
  // Support case-insensitive trim comparison for user-friendliness while protecting security
  return (
    inputPassword.trim() === target ||
    inputPassword.trim().toLowerCase() === target.toLowerCase()
  );
}

/**
 * Middleware/helper to verify if the request is authorized as admin
 */
export function isAdminAuthorized(req: any): boolean {
  // Check header 'x-admin-password'
  const headerPass = req.headers?.['x-admin-password'];
  if (headerPass && verifyPassword(headerPass as string)) {
    return true;
  }

  // Check Authorization Bearer token
  const authHeader = req.headers?.['authorization'];
  if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    if (verifyAdminToken(token)) {
      return true;
    }
  }

  // Check body password
  if (req.body && typeof req.body.password === 'string' && verifyPassword(req.body.password)) {
    return true;
  }

  return false;
}
