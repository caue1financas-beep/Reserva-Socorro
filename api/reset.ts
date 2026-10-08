import { resetPersons } from './storage';
import { isAdminAuthorized } from './auth';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, x-admin-password'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    if (!isAdminAuthorized(req)) {
      return res.status(401).json({
        error: 'Não autorizado. Autenticação de administrador necessária para restaurar a lista.',
      });
    }

    try {
      const resetData = await resetPersons();
      return res.status(200).json({ success: true, data: resetData });
    } catch (err) {
      console.error('[API reset POST] error:', err);
      return res.status(500).json({ error: 'Erro ao restaurar dados' });
    }
  }

  return res.status(405).json({ error: 'Método não permitido' });
}
