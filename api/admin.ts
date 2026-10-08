import type { Request, Response } from 'express';
import { verifyPassword, generateAdminToken, isAdminAuthorized } from './auth';

export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, x-admin-password'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET: Check if current token/password in header is valid
  if (req.method === 'GET') {
    const isAuth = isAdminAuthorized(req);
    return res.status(200).json({ authenticated: isAuth });
  }

  // POST: Login / Password Verification
  if (req.method === 'POST') {
    const { password, username } = req.body || {};

    if (!password) {
      return res.status(400).json({
        success: false,
        error: 'Senha não informada.',
      });
    }

    const isValid = verifyPassword(password);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: 'Senha incorreta. Acesso não autorizado.',
      });
    }

    const token = generateAdminToken();
    return res.status(200).json({
      success: true,
      token,
      message: 'Autenticação realizada com sucesso no backend!',
    });
  }

  return res.status(405).json({ error: 'Método não permitido' });
}
