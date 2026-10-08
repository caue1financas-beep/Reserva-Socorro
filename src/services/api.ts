import { PersonDebt } from '../types';

const TOKEN_KEY = 'admin_session_token';

export function getStoredToken(): string | null {
  try {
    return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string): void {
  try {
    sessionStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(TOKEN_KEY, token);
  } catch (err) {
    console.error(err);
  }
}

export function removeStoredToken(): void {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_KEY);
  } catch (err) {
    console.error(err);
  }
}

/**
 * Fetch all persons from the server
 */
export async function fetchPersons(): Promise<PersonDebt[]> {
  const res = await fetch('/api/persons', {
    headers: {
      Accept: 'application/json',
    },
  });
  if (!res.ok) {
    throw new Error('Falha ao obter lista de participantes do servidor.');
  }
  return res.json();
}

/**
 * Authenticate against /api/admin backend route
 * Compares password exclusively against process.env.ADMIN_PASSWORD in backend
 */
export async function loginAdmin(password: string, username?: string): Promise<{ success: boolean; token?: string; error?: string }> {
  try {
    const res = await fetch('/api/admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password, username }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return {
        success: false,
        error: data.error || 'Senha incorreta.',
      };
    }

    if (data.token) {
      setStoredToken(data.token);
    }
    return {
      success: true,
      token: data.token,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Erro de conexão com o servidor.',
    };
  }
}

/**
 * Update person on backend (protected)
 * Allows updating expectedFood, expectedReserve, paidAmount, name, etc.
 */
export async function updatePersonApi(
  id: string,
  updates: Partial<PersonDebt>,
  token?: string
): Promise<PersonDebt> {
  const authToken = token || getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const res = await fetch(`/api/persons/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(updates),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Erro ao atualizar dados no servidor.');
  }

  return res.json();
}

/**
 * Delete person on backend (protected)
 */
export async function deletePersonApi(id: string, token?: string): Promise<boolean> {
  const authToken = token || getStoredToken();
  const headers: Record<string, string> = {};
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const res = await fetch(`/api/persons/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Erro ao excluir participante no servidor.');
  }

  return true;
}

/**
 * Add person on backend (protected)
 */
export async function addPersonApi(
  newPerson: Omit<PersonDebt, 'id'>,
  token?: string
): Promise<PersonDebt> {
  const authToken = token || getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const res = await fetch('/api/persons', {
    method: 'POST',
    headers,
    body: JSON.stringify(newPerson),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Erro ao adicionar participante no servidor.');
  }

  return res.json();
}

/**
 * Reset all persons on backend (protected)
 */
export async function resetPersonsApi(token?: string): Promise<PersonDebt[]> {
  const authToken = token || getStoredToken();
  const headers: Record<string, string> = {};
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const res = await fetch('/api/reset', {
    method: 'POST',
    headers,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Erro ao restaurar dados no servidor.');
  }

  const data = await res.json();
  return data.data;
}
