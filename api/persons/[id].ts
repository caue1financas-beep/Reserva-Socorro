import { updatePerson, deletePerson } from '../storage';
import { isAdminAuthorized } from '../auth';

export default async function handler(req: any, res: any) {
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

  // Extract ID from query (Vercel) or params (Express)
  const id = req.query?.id || req.params?.id;

  if (!id) {
    return res.status(400).json({ error: 'ID do participante não informado' });
  }

  // Authentication check for protected actions (Edit and Delete)
  if (!isAdminAuthorized(req)) {
    return res.status(401).json({
      error: 'Não autorizado. Autenticação de administrador necessária para editar ou excluir.',
    });
  }

  // PUT / PATCH: Edit person values (including expectedFood and expectedReserve)
  if (req.method === 'PUT' || req.method === 'PATCH') {
    try {
      const updates = req.body || {};
      const updated = await updatePerson(String(id), updates);
      if (!updated) {
        return res.status(404).json({ error: 'Participante não encontrado' });
      }
      return res.status(200).json(updated);
    } catch (err) {
      console.error('[API persons PUT] error:', err);
      return res.status(500).json({ error: 'Erro ao atualizar dados' });
    }
  }

  // DELETE: Delete person from list
  if (req.method === 'DELETE') {
    try {
      const success = await deletePerson(String(id));
      if (!success) {
        return res.status(404).json({ error: 'Participante não encontrado' });
      }
      return res.status(200).json({ success: true, message: 'Participante excluído com sucesso' });
    } catch (err) {
      console.error('[API persons DELETE] error:', err);
      return res.status(500).json({ error: 'Erro ao excluir participante' });
    }
  }

  return res.status(405).json({ error: 'Método não permitido' });
}
