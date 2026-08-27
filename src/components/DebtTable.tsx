import React, { useState } from 'react';
import {
  Search,
  Edit3,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  Clock,
  Filter,
  Users,
  Baby,
  Calendar,
  Building2,
  UtensilsCrossed,
} from 'lucide-react';
import { PersonDebt, FilterStatus, SortOption } from '../types';
import { formatCurrency, generateIndividualMessage, getPersonDeadlineBreakdown } from '../utils/formatters';

interface DebtTableProps {
  data: PersonDebt[];
  onOpenPaymentModal: (person: PersonDebt) => void;
}

export const DebtTable: React.FC<DebtTableProps> = ({ data, onOpenPaymentModal }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('pending_desc');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyIndividual = async (person: PersonDebt) => {
    const text = generateIndividualMessage(person);
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(person.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  // Filter
  const filteredData = data.filter((person) => {
    const matchesSearch = person.name.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    const breakdown = getPersonDeadlineBreakdown(person);

    if (activeFilter === 'all') return true;
    if (activeFilter === 'pending_reserve_10_09') return breakdown.pendingReserve > 0;
    if (activeFilter === 'paid_reserve_10_09') return breakdown.isReservePaid;
    if (activeFilter === 'pending_food_07_10') return breakdown.pendingFood > 0;
    if (activeFilter === 'fully_paid') return person.pendingAmount === 0;
    if (activeFilter === 'partial') return person.paidAmount > 0 && person.pendingAmount > 0;
    if (activeFilter === 'unpaid') return person.paidAmount === 0;
    if (activeFilter === 'adult') return person.category === 'adulto';
    if (activeFilter === 'child') return person.category === 'crianca_outros';
    return true;
  });

  // Sort
  const sortedData = [...filteredData].sort((a, b) => {
    const bBreakdown = getPersonDeadlineBreakdown(b);
    const aBreakdown = getPersonDeadlineBreakdown(a);

    if (sortBy === 'pending_desc') return b.pendingAmount - a.pendingAmount;
    if (sortBy === 'pending_asc') return a.pendingAmount - b.pendingAmount;
    if (sortBy === 'name_asc') return a.name.localeCompare(b.name, 'pt-BR');
    if (sortBy === 'paid_desc') return b.paidAmount - a.paidAmount;
    if (sortBy === 'total_desc') return b.totalExpected - a.totalExpected;
    return 0;
  });

  const getCategoryBadge = (category: string) => {
    if (category === 'adulto') {
      return (
        <span className="text-[11px] font-medium text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60 inline-flex items-center gap-1">
          <Users className="w-3 h-3 text-slate-400" /> Adulto
        </span>
      );
    }
    return (
      <span className="text-[11px] font-medium text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60 inline-flex items-center gap-1">
        <Baby className="w-3 h-3 text-cyan-400" /> Criança
      </span>
    );
  };

  return (
    <div id="debt-table-wrapper" className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
      {/* Controls Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-800 space-y-4">
        {/* Search & Sort Row */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="search-person-input"
              type="text"
              placeholder="Buscar por nome (ex: Eder, Carol, Dudu, Miriam)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-slate-600 transition"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                Limpar
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 hidden sm:inline">Ordenar:</span>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-slate-600"
            >
              <option value="pending_desc">Maior valor pendente total</option>
              <option value="pending_asc">Menor valor pendente total</option>
              <option value="name_asc">Nome (A - Z)</option>
              <option value="paid_desc">Maior valor já pago</option>
              <option value="total_desc">Maior valor total</option>
            </select>
          </div>
        </div>

        {/* Filter Pills with Specific Deadlines */}
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filtros:
          </span>
          <button
            type="button"
            id="filter-all-btn"
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1 text-xs rounded-lg font-medium transition ${
              activeFilter === 'all'
                ? 'bg-white text-slate-950 font-bold'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            Todos ({data.length})
          </button>
          <button
            type="button"
            id="filter-pending-reserve-btn"
            onClick={() => setActiveFilter('pending_reserve_10_09')}
            className={`px-3 py-1 text-xs rounded-lg font-medium transition flex items-center gap-1.5 ${
              activeFilter === 'pending_reserve_10_09'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-950 text-amber-400 hover:bg-amber-950/40 border border-amber-900/60'
            }`}
          >
            <Calendar className="w-3 h-3" /> Falta Reserva (10/09) ({data.filter((p) => getPersonDeadlineBreakdown(p).pendingReserve > 0).length})
          </button>
          <button
            type="button"
            id="filter-paid-reserve-btn"
            onClick={() => setActiveFilter('paid_reserve_10_09')}
            className={`px-3 py-1 text-xs rounded-lg font-medium transition ${
              activeFilter === 'paid_reserve_10_09'
                ? 'bg-emerald-500 text-white font-bold'
                : 'bg-slate-950 text-emerald-400 hover:bg-emerald-950/40 border border-slate-800'
            }`}
          >
            Reserva Quitada ({data.filter((p) => getPersonDeadlineBreakdown(p).isReservePaid).length})
          </button>
          <button
            type="button"
            id="filter-pending-food-btn"
            onClick={() => setActiveFilter('pending_food_07_10')}
            className={`px-3 py-1 text-xs rounded-lg font-medium transition ${
              activeFilter === 'pending_food_07_10'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'bg-slate-950 text-cyan-400 hover:bg-cyan-950/40 border border-slate-800'
            }`}
          >
            Falta Alimentação (07/10) ({data.filter((p) => getPersonDeadlineBreakdown(p).pendingFood > 0).length})
          </button>
          <button
            type="button"
            id="filter-fully-paid-btn"
            onClick={() => setActiveFilter('fully_paid')}
            className={`px-3 py-1 text-xs rounded-lg font-medium transition ${
              activeFilter === 'fully_paid'
                ? 'bg-emerald-600 text-white font-bold'
                : 'bg-slate-950 text-emerald-300 hover:bg-emerald-950/40 border border-slate-800'
            }`}
          >
            100% Quitado ({data.filter((p) => p.pendingAmount === 0).length})
          </button>
        </div>
      </div>

      {/* Table for Desktop & Tablet */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 text-xs uppercase font-semibold">
              <th className="py-3.5 px-4 sm:px-6">Participante</th>
              <th className="py-3.5 px-4 bg-amber-950/20 border-x border-amber-900/30 text-amber-300">
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>1ª Parcela: Reserva (10/09)</span>
                </div>
              </th>
              <th className="py-3.5 px-4 bg-cyan-950/20 border-r border-cyan-900/30 text-cyan-300">
                <div className="flex items-center gap-1.5">
                  <UtensilsCrossed className="w-3.5 h-3.5 text-cyan-400" />
                  <span>2ª Parcela: Alimentação (07/10)</span>
                </div>
              </th>
              <th className="py-3.5 px-4">Total Pago</th>
              <th className="py-3.5 px-4">Falta Geral</th>
              <th className="py-3.5 px-4 sm:px-6 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {sortedData.map((person) => {
              const b = getPersonDeadlineBreakdown(person);
              const isFullyPaid = person.pendingAmount === 0;

              return (
                <tr
                  key={person.id}
                  id={`person-row-${person.id}`}
                  className={`hover:bg-slate-800/40 transition group ${
                    isFullyPaid ? 'bg-emerald-950/10' : ''
                  }`}
                >
                  {/* Nome & Categoria */}
                  <td className="py-3.5 px-4 sm:px-6">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          isFullyPaid
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/80'
                            : b.isReservePaid
                            ? 'bg-amber-950 text-amber-400 border border-amber-800/80'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}
                      >
                        {person.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm flex items-center gap-2">
                          {person.name}
                          {isFullyPaid && (
                            <span className="text-[10px] bg-emerald-900/80 text-emerald-300 px-1.5 py-0.2 rounded font-semibold border border-emerald-700/60">
                              QUITADO
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {getCategoryBadge(person.category)}
                          <span className="text-[11px] text-slate-400">Total: {formatCurrency(person.totalExpected)}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* 1ª Parcela: Reserva (10/09) */}
                  <td className="py-3.5 px-4 bg-amber-950/10 border-x border-amber-900/20">
                    {b.reserveExpected > 0 ? (
                      b.isReservePaid ? (
                        <div className="text-xs">
                          <span className="inline-flex items-center gap-1 text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
                            <Check className="w-3 h-3" /> Quitado ({formatCurrency(b.reserveExpected)})
                          </span>
                        </div>
                      ) : (
                        <div>
                          <div className="font-bold text-amber-400 text-sm">
                            Falta {formatCurrency(b.pendingReserve)}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            Pago {formatCurrency(b.paidForReserve)} de {formatCurrency(b.reserveExpected)}
                          </div>
                        </div>
                      )
                    ) : (
                      <span className="text-xs text-slate-400 italic">Isento (R$ 0,00)</span>
                    )}
                  </td>

                  {/* 2ª Parcela: Alimentação (07/10) */}
                  <td className="py-3.5 px-4 bg-cyan-950/10 border-r border-cyan-900/20">
                    {b.isFoodPaid ? (
                      <div className="text-xs">
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
                          <Check className="w-3 h-3" /> Quitado ({formatCurrency(b.foodExpected)})
                        </span>
                      </div>
                    ) : (
                      <div>
                        <div className="font-bold text-cyan-400 text-sm">
                          Falta {formatCurrency(b.pendingFood)}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Pago {formatCurrency(b.paidForFood)} de {formatCurrency(b.foodExpected)}
                        </div>
                      </div>
                    )}
                  </td>

                  {/* Valor Total Já Pago */}
                  <td className="py-3.5 px-4 font-semibold text-emerald-400">
                    {formatCurrency(person.paidAmount)}
                  </td>

                  {/* Valor Pendente Geral */}
                  <td className="py-3.5 px-4">
                    {isFullyPaid ? (
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Quitado
                      </span>
                    ) : (
                      <div>
                        <span className="font-bold text-rose-400 text-sm">
                          {formatCurrency(person.pendingAmount)}
                        </span>
                        <div className="text-[10px] text-slate-400">
                          {((person.paidAmount / person.totalExpected) * 100).toFixed(0)}% pago
                        </div>
                      </div>
                    )}
                  </td>

                  {/* Ações */}
                  <td className="py-3.5 px-4 sm:px-6 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Copy WhatsApp text */}
                      <button
                        type="button"
                        id={`copy-btn-${person.id}`}
                        title="Copiar mensagem individual com prazos 10/09 e 07/10"
                        onClick={() => handleCopyIndividual(person)}
                        className={`p-1.5 rounded-lg border transition ${
                          copiedId === person.id
                            ? 'bg-emerald-900/80 border-emerald-500 text-emerald-300'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                        }`}
                      >
                        {copiedId === person.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>

                      {/* Edit / Pay Modal */}
                      <button
                        type="button"
                        id={`edit-pay-btn-${person.id}`}
                        onClick={() => onOpenPaymentModal(person)}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-semibold border border-slate-700 flex items-center gap-1 transition"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Atualizar
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {sortedData.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500">
                  Nenhum participante encontrado com os filtros selecionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer summary */}
      <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
        <div className="flex items-center gap-4">
          <span>
            Mostrando <strong className="text-white">{sortedData.length}</strong> de <strong className="text-white">{data.length}</strong>
          </span>
          <span>
            Pendente Reserva (10/09): <strong className="text-amber-400 font-bold">{formatCurrency(sortedData.reduce((acc, c) => acc + getPersonDeadlineBreakdown(c).pendingReserve, 0))}</strong>
          </span>
          <span>
            Pendente Alimentação (07/10): <strong className="text-cyan-400 font-bold">{formatCurrency(sortedData.reduce((acc, c) => acc + getPersonDeadlineBreakdown(c).pendingFood, 0))}</strong>
          </span>
        </div>
        <span>
          Total Geral Restante: <strong className="text-rose-400 font-bold">{formatCurrency(sortedData.reduce((acc, c) => acc + c.pendingAmount, 0))}</strong>
        </span>
      </div>
    </div>
  );
};
