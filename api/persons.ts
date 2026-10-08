import { getPersons, addPerson } from './storage';

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

  // GET: Read all persons
  if (req.method === 'GET') {
    try {
      const data = await getPersons();
      return res.status(200).json(data);
    } catch (err) {
      console.error('[API persons GET] error:', err);
      return res.status(500).json({ error: 'Erro ao carregar dados' });
    }
  }

  // POST: Add new person
  if (req.method === 'POST') {
    try {
      const { name, category, expectedReserve, expectedFood, paidAmount, notes } = req.body || {};
      if (!name) {
        return res.status(400).json({ error: 'Nome é obrigatório.' });
      }

      const created = await addPerson({
        name: String(name).trim(),
        category: category === 'crianca_outros' ? 'crianca_outros' : 'adulto',
        expectedReserve: Number(expectedReserve) || 0,
        expectedFood: Number(expectedFood) || 0,
        totalExpected: (Number(expectedReserve) || 0) + (Number(expectedFood) || 0),
        paidAmount: Number(paidAmount) || 0,
        pendingAmount: Math.max(0, (Number(expectedReserve) || 0) + (Number(expectedFood) || 0) - (Number(paidAmount) || 0)),
        status: (Number(paidAmount) || 0) >= ((Number(expectedReserve) || 0) + (Number(expectedFood) || 0)) ? 'quitado' : (Number(paidAmount) || 0) > 0 ? 'parcial' : 'pendente_total',
        notes: notes ? String(notes).trim() : undefined,
      });

      return res.status(201).json(created);
    } catch (err) {
      console.error('[API persons POST] error:', err);
      return res.status(500).json({ error: 'Erro ao criar participante' });
    }
  }

  return res.status(405).json({ error: 'Método não permitido' });
}
