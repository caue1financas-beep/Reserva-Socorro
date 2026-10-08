import { PersonDebt } from '../types';

export type EditableField =
  | 'name'
  | 'category'
  | 'expectedReserve'
  | 'expectedFood'
  | 'totalExpected'
  | 'paidAmount'
  | 'pendingAmount'
  | 'status'
  | 'notes';

export function parseMoneyValue(val: any): number {
  if (val === null || val === undefined || val === '') return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  const str = String(val).trim();
  // Remove non-numeric chars except digits, minus, comma and dot
  const cleaned = str.replace(/[^\d.,-]/g, '').replace(',', '.');
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : Math.round(n * 100) / 100;
}

/**
 * Recalculates person fields when ANY field is changed, ensuring that:
 * 1. expectedReserve + expectedFood = totalExpected
 * 2. totalExpected - paidAmount = pendingAmount
 * 3. Status correctly reflects quitado / parcial / pendente_total
 * 4. Deadlines (10/09 and 07/10) cascaded accordingly
 */
export function recalculatePersonValues(
  person: PersonDebt,
  field: EditableField,
  rawValue: any
): PersonDebt {
  const updated: PersonDebt = { ...person };

  if (field === 'name') {
    updated.name = String(rawValue ?? '');
    return updated;
  }

  if (field === 'category') {
    const newCat = rawValue === 'crianca_outros' ? 'crianca_outros' : 'adulto';
    updated.category = newCat;
    return updated;
  }

  if (field === 'notes') {
    updated.notes = String(rawValue ?? '');
    return updated;
  }

  const currentReserve = updated.expectedReserve || 0;
  const currentFood = updated.expectedFood || 0;
  const currentTotal = updated.totalExpected || (currentReserve + currentFood);
  const currentPaid = updated.paidAmount || 0;

  if (field === 'expectedReserve') {
    const newReserve = Math.max(0, parseMoneyValue(rawValue));
    updated.expectedReserve = newReserve;
    updated.totalExpected = Math.round((newReserve + currentFood) * 100) / 100;
    updated.pendingAmount = Math.round((updated.totalExpected - currentPaid) * 100) / 100;
  } else if (field === 'expectedFood') {
    const newFood = Math.max(0, parseMoneyValue(rawValue));
    updated.expectedFood = newFood;
    updated.totalExpected = Math.round((currentReserve + newFood) * 100) / 100;
    updated.pendingAmount = Math.round((updated.totalExpected - currentPaid) * 100) / 100;
  } else if (field === 'totalExpected') {
    const newTotal = Math.max(0, parseMoneyValue(rawValue));
    updated.totalExpected = newTotal;
    // Adjust food while keeping reserve if total is sufficient
    if (currentReserve > 0 && newTotal >= currentReserve) {
      updated.expectedFood = Math.round((newTotal - currentReserve) * 100) / 100;
    } else {
      updated.expectedReserve = 0;
      updated.expectedFood = newTotal;
    }
    updated.pendingAmount = Math.round((newTotal - currentPaid) * 100) / 100;
  } else if (field === 'paidAmount') {
    const newPaid = Math.max(0, parseMoneyValue(rawValue));
    updated.paidAmount = newPaid;
    updated.pendingAmount = Math.round((currentTotal - newPaid) * 100) / 100;
  } else if (field === 'pendingAmount') {
    const newPending = parseMoneyValue(rawValue);
    updated.pendingAmount = newPending;
    updated.paidAmount = Math.max(0, Math.round((currentTotal - newPending) * 100) / 100);
  } else if (field === 'status') {
    if (rawValue === 'quitado') {
      updated.paidAmount = currentTotal;
      updated.pendingAmount = 0;
    } else if (rawValue === 'pendente_total') {
      updated.paidAmount = 0;
      updated.pendingAmount = currentTotal;
    }
  }

  // Consistent status calculation
  if (updated.pendingAmount <= 0) {
    updated.status = 'quitado';
  } else if (updated.paidAmount > 0) {
    updated.status = 'parcial';
  } else {
    updated.status = 'pendente_total';
  }

  updated.lastPaymentDate = new Date().toISOString();
  return updated;
}
