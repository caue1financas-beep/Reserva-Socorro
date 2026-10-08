import type { Request, Response } from 'express';
import { verifyPassword, generateAdminToken, isAdminAuthorized, getAdminPassword } from './auth';

export default async function handler(req: any, res: any) {
  // Ensure response always has JSON Content-Type
  res.setHeader('Content-Type', 'application/json');

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, x-admin-password'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).json({ success: true });
  }

  try {
    // Check if ADMIN_PASSWORD environment variable or fallback is configured
    const configuredPassword = process.env.ADMIN_PASSWORD;
    if (!configuredPassword && !getAdminPassword()) {
      console.error('[API /api/admin] ADMIN_PASSWORD environment variable is not configured');
      return res.status(500).json({
        success: false,
        message: 'Variável de ambiente ADMIN_PASSWORD não configurada no servidor.',
        error: 'Variável de ambiente ADMIN_PASSWORD não configurada no servidor.',
      });
    }

    // GET: Check if current token/password in header is valid
    if (req.method === 'GET') {
      const isAuth = isAdminAuthorized(req);
      return res.status(200).json({
        success: isAuth,
        authenticated: isAuth,
      });
    }

    // POST: Login / Password Verification
    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      const { password } = body;

      if (!password || (typeof password === 'string' && password.trim() === '')) {
        return res.status(400).json({
          success: false,
          message: 'Senha não informada.',
          error: 'Senha não informada.',
        });
      }

      // If ADMIN_PASSWORD specifically is required and missing in env
      if (!process.env.ADMIN_PASSWORD && !getAdminPassword()) {
        return res.status(500).json({
          success: false,
          message: 'Variável de ambiente ADMIN_PASSWORD não configurada no servidor.',
          error: 'Variável de ambiente ADMIN_PASSWORD não configurada no servidor.',
        });
      }

      const isValid = verifyPassword(password);
      if (!isValid) {
        return res.status(401).json({
          success: false,
          message: 'Senha incorreta. Acesso não autorizado.',
          error: 'Senha incorreta. Acesso não autorizado.',
        });
      }

      const token = generateAdminToken();
      return res.status(200).json({
        success: true,
        token,
        message: 'Autenticação realizada com sucesso!',
      });
    }

    return res.status(405).json({
      success: false,
      message: `Método ${req.method} não permitido.`,
      error: `Método ${req.method} não permitido.`,
    });
  } catch (err: any) {
    console.error('[API /api/admin] Internal Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Erro interno no servidor',
      error: err?.message || 'Erro interno no servidor',
    });
  }
}

