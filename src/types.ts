export interface PersonDebt {
  id: string;
  name: string;
  category: 'adulto' | 'crianca_outros';
  expectedReserve: number;
  expectedFood: number;
  totalExpected: number;
  paidAmount: number;
  pendingAmount: number;
  status: 'quitado' | 'parcial' | 'pendente_total';
  notes?: string;
  lastPaymentDate?: string;
}

export type FilterStatus = 'all' | 'pending' | 'partial' | 'paid' | 'unpaid';
export type SortOption = 'pending_desc' | 'pending_asc' | 'name_asc' | 'paid_desc' | 'total_desc';
