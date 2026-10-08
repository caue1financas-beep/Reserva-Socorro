import fs from 'fs';
import path from 'path';
import { PersonDebt } from '../src/types';
import { INITIAL_DEBT_DATA } from '../src/data/initialData';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'persons.json');

// Memory cache
let inMemoryPersons: PersonDebt[] = [...INITIAL_DEBT_DATA];
let isLoaded = false;

/**
 * Checks if Vercel KV or Upstash Redis REST is configured
 */
function getKvConfig() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    return { url, token };
  }
  return null;
}

/**
 * Read from Vercel KV / Upstash Redis
 */
async function readFromKV(url: string, token: string): Promise<PersonDebt[] | null> {
  try {
    const res = await fetch(`${url}/get/reserva_persons_data`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (json && json.result) {
      const data = typeof json.result === 'string' ? JSON.parse(json.result) : json.result;
      if (Array.isArray(data) && data.length > 0) {
        return data as PersonDebt[];
      }
    }
  } catch (err) {
    console.error('[Storage KV] Read error:', err);
  }
  return null;
}

/**
 * Write to Vercel KV / Upstash Redis
 */
async function writeToKV(url: string, token: string, data: PersonDebt[]): Promise<boolean> {
  try {
    const res = await fetch(`${url}/set/reserva_persons_data`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch (err) {
    console.error('[Storage KV] Write error:', err);
    return false;
  }
}

/**
 * Read from local JSON file
 */
function readFromFile(): PersonDebt[] | null {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed as PersonDebt[];
      }
    }
  } catch (err) {
    console.error('[Storage File] Read error:', err);
  }
  return null;
}

/**
 * Write to local JSON file
 */
function writeToFile(data: PersonDebt[]) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Storage File] Write error:', err);
  }
}

/**
 * Get all persons from persistent storage
 */
export async function getPersons(): Promise<PersonDebt[]> {
  const kv = getKvConfig();
  if (kv) {
    const kvData = await readFromKV(kv.url, kv.token);
    if (kvData) {
      inMemoryPersons = kvData;
      isLoaded = true;
      return inMemoryPersons;
    }
  }

  if (!isLoaded) {
    const fileData = readFromFile();
    if (fileData) {
      inMemoryPersons = fileData;
    } else {
      // Seed with initial data
      inMemoryPersons = [...INITIAL_DEBT_DATA];
      writeToFile(inMemoryPersons);
      if (kv) {
        await writeToKV(kv.url, kv.token, inMemoryPersons);
      }
    }
    isLoaded = true;
  }

  return inMemoryPersons;
}

/**
 * Save persons array to storage
 */
export async function savePersons(data: PersonDebt[]): Promise<void> {
  inMemoryPersons = data;
  isLoaded = true;

  // Save to file locally
  writeToFile(data);

  // Save to Vercel KV if configured
  const kv = getKvConfig();
  if (kv) {
    await writeToKV(kv.url, kv.token, data);
  }
}

/**
 * Update an existing person with dynamic recalculation for all editable fields
 */
export async function updatePerson(id: string, updates: Partial<PersonDebt>): Promise<PersonDebt | null> {
  const current = await getPersons();
  const index = current.findIndex((p) => String(p.id) === String(id));
  if (index === -1) return null;

  const existing = current[index];
  
  let expectedReserve = updates.expectedReserve !== undefined ? Number(updates.expectedReserve) : existing.expectedReserve;
  let expectedFood = updates.expectedFood !== undefined ? Number(updates.expectedFood) : existing.expectedFood;
  let totalExpected = updates.totalExpected !== undefined ? Number(updates.totalExpected) : (expectedReserve + expectedFood);

  // If totalExpected was updated directly without explicit reserve/food breakdown
  if (updates.totalExpected !== undefined && updates.expectedReserve === undefined && updates.expectedFood === undefined) {
    if (existing.expectedReserve > 0 && totalExpected >= existing.expectedReserve) {
      expectedReserve = existing.expectedReserve;
      expectedFood = Math.round((totalExpected - existing.expectedReserve) * 100) / 100;
    } else {
      expectedReserve = 0;
      expectedFood = totalExpected;
    }
  } else {
    totalExpected = Math.round((expectedReserve + expectedFood) * 100) / 100;
  }

  let paidAmount = updates.paidAmount !== undefined ? Number(updates.paidAmount) : existing.paidAmount;

  // If pendingAmount was updated directly without updating paidAmount
  if (updates.pendingAmount !== undefined && updates.paidAmount === undefined) {
    paidAmount = Math.max(0, Math.round((totalExpected - Number(updates.pendingAmount)) * 100) / 100);
  }

  // If quick status 'quitado'
  if (updates.status === 'quitado' && updates.paidAmount === undefined) {
    paidAmount = totalExpected;
  }

  let pendingAmount = Math.round((totalExpected - paidAmount) * 100) / 100;

  let status: 'quitado' | 'parcial' | 'pendente_total' = 'pendente_total';
  if (pendingAmount <= 0) status = 'quitado';
  else if (paidAmount > 0) status = 'parcial';

  const updatedPerson: PersonDebt = {
    ...existing,
    ...updates,
    expectedReserve,
    expectedFood,
    totalExpected,
    paidAmount,
    pendingAmount,
    status,
    lastPaymentDate: new Date().toISOString(),
  };

  current[index] = updatedPerson;
  await savePersons(current);
  return updatedPerson;
}

/**
 * Delete a person by id
 */
export async function deletePerson(id: string): Promise<boolean> {
  const current = await getPersons();
  const index = current.findIndex((p) => String(p.id) === String(id));
  if (index === -1) return false;

  const updated = current.filter((p) => String(p.id) !== String(id));
  await savePersons(updated);
  return true;
}

/**
 * Add a new person
 */
export async function addPerson(newPersonData: Omit<PersonDebt, 'id'>): Promise<PersonDebt> {
  const current = await getPersons();
  const totalExpected = newPersonData.expectedReserve + newPersonData.expectedFood;
  const pendingAmount = totalExpected - newPersonData.paidAmount;

  let status: 'quitado' | 'parcial' | 'pendente_total' = 'pendente_total';
  if (pendingAmount <= 0) status = 'quitado';
  else if (newPersonData.paidAmount > 0) status = 'parcial';

  const newPerson: PersonDebt = {
    ...newPersonData,
    id: Date.now().toString(),
    totalExpected,
    pendingAmount,
    status,
  };

  current.push(newPerson);
  await savePersons(current);
  return newPerson;
}

/**
 * Reset persons to initial state
 */
export async function resetPersons(): Promise<PersonDebt[]> {
  const fresh = [...INITIAL_DEBT_DATA];
  await savePersons(fresh);
  return fresh;
}
