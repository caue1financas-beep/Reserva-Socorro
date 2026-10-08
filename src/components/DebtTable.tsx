import React, { useState } from 'react';
import {
  Search,
  Edit3,
  Copy,
  Check,
  CheckCircle2,
  Filter,
  Users,
  Baby,
  Calendar,
  Building2,
  UtensilsCrossed,
  Calculator,
  Save,
  RotateCcw,
} from 'lucide-react';
import { PersonDebt, FilterStatus, SortOption } from '../types';
import { formatCurrency, generateIndividualMessage, getPersonDeadlineBreakdown } from '../utils/formatters';
import { EditableField } from '../utils/calculations';

interface DebtTableProps {
  data: PersonDebt[];
  isEditMode?: boolean;
  onEditPerson: (person: PersonDebt) => void;
  onUpdatePersonField?: (personId: string, field: EditableField, value: any) => void;
  onToggleEditMode?: () => void;
}

export const DebtTable: React.FC<DebtTableProps> = ({
  data,
  isEditMode = false,
  onEditPerson,
  onUpdatePersonField,
  onToggleEditMode,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('pending_desc');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [recentlyEditedId, setRecentlyEditedId] = useState<string | null>(null);

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

  const handleCellChange = (personId: string, field: EditableField, value: any) => {
    if (onUpdatePersonField) {
      onUpdatePersonField(personId, field, value);
      setRecentlyEditedId(personId);
      setTimeout(() => setRecentlyEditedId(null), 1500);
    }
  };

  const isVacant = (name: string) => name.toLowerCase().includes('vaga') || name.toLowerCase().includes('disponível');
  const validData = data.filter((p) => !isVacant(p.name));
  const totalArrecadadoGeral = validData.reduce((acc, curr) => acc + curr.paidAmount, 0);
  const saldoEmConta = totalArrecadadoGeral - 2500;

  // Filter
  const filteredData = data.filter((person) => {
    if (isVacant(person.name)) return false;
    const matchesSearch = person.name.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    const breakdown = getPersonDeadlineBreakdown(person);

    if (activeFilter === 'all') return true;
    if (activeFilter === 'pending_reserve_10_09') return breakdown.pendingReserve > 0;
    if (activeFilter === 'paid_reserve_10_09') return breakdown.isReservePaid;
    if (activeFilter === 'pending_food_07_10') return breakdown.pendingFood > 0;
    if (activeFilter === 'fully_paid') return person.pendingAmount <= 0;
    if (activeFilter === 'partial') return person.paidAmount > 0 && person.pendingAmount > 0;
    if (activeFilter === 'unpaid') return person.paidAmount === 0;
    if (activeFilter === 'adult') return person.category === 'adulto';
    if (activeFilter === 'child') return person.category === 'crianca_outros';
    return true;
  });

  // Sort
  const sortedData = [...filteredData].sort((a, b) => {
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
        <span className="text-[11px] font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 inline-flex items-center gap-1">
          <Users className="w-3 h-3 text-slate-500" /> Adulto
        </span>
      );
    }
    return (
      <span className="text-[11px] font-medium text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200 inline-flex items-center gap-1">
        <Baby className="w-3 h-3 text-cyan-600" /> Criança
      </span>
    );
  };

  return (
    <div id="debt-table-wrapper" className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      {/* Controls Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 space-y-4">
        {/* Search, Sort & Table Mode Toggle Row */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="search-person-input"
              type="text"
              placeholder="Buscar por nome (ex: Eder, Carol, Dudu, Miriam)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl py-2 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition shadow-xs"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                Limpar
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-600 font-medium hidden sm:inline">Ordenar:</span>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-white border border-slate-300 text-slate-800 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500 shadow-xs cursor-pointer"
              >
                <option value="pending_desc">Maior valor pendente total</option>
                <option value="pending_asc">Menor valor pendente total</option>
                <option value="name_asc">Nome (A - Z)</option>
                <option value="paid_desc">Maior valor já pago</option>
                <option value="total_desc">Maior valor total</option>
              </select>
            </div>

            {onToggleEditMode && (
              <button
                type="button"
                id="toggle-table-edit-btn"
                onClick={onToggleEditMode}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
                  isEditMode
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-white text-slate-700 hover:text-emerald-900 border border-slate-300 hover:bg-emerald-50'
                }`}
                title={isEditMode ? 'Voltar para modo de visualização' : 'Liberar edição direta em todas as células'}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditMode ? 'Edição na Tabela: ATIVA' : 'Habilitar Edição na Tabela'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Pills with Specific Deadlines */}
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-xs font-semibold text-slate-600 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filtros:
          </span>
          <button
            type="button"
            id="filter-all-btn"
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 text-xs rounded-lg font-semibold transition cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            Todos ({data.length})
          </button>
          <button
            type="button"
            id="filter-pending-reserve-btn"
            onClick={() => setActiveFilter('pending_reserve_10_09')}
            className={`px-3 py-1.5 text-xs rounded-lg font-semibold transition flex items-center gap-1.5 cursor-pointer ${
              activeFilter === 'pending_reserve_10_09'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white text-amber-800 hover:bg-amber-50 border border-amber-200'
            }`}
          >
            <Calendar className="w-3 h-3" /> Falta Reserva (10/09) ({data.filter((p) => getPersonDeadlineBreakdown(p).pendingReserve > 0).length})
          </button>
          <button
            type="button"
            id="filter-paid-reserve-btn"
            onClick={() => setActiveFilter('paid_reserve_10_09')}
            className={`px-3 py-1.5 text-xs rounded-lg font-semibold transition cursor-pointer ${
              activeFilter === 'paid_reserve_10_09'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-emerald-800 hover:bg-emerald-50 border border-emerald-200'
            }`}
          >
            Reserva Quitada ({data.filter((p) => getPersonDeadlineBreakdown(p).isReservePaid).length})
          </button>
          <button
            type="button"
            id="filter-pending-food-btn"
            onClick={() => setActiveFilter('pending_food_07_10')}
            className={`px-3 py-1.5 text-xs rounded-lg font-semibold transition cursor-pointer ${
              activeFilter === 'pending_food_07_10'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-white text-sky-800 hover:bg-sky-50 border border-sky-200'
            }`}
          >
            Falta Alimentação (07/10) ({data.filter((p) => getPersonDeadlineBreakdown(p).pendingFood > 0).length})
          </button>
          <button
            type="button"
            id="filter-fully-paid-btn"
            onClick={() => setActiveFilter('fully_paid')}
            className={`px-3 py-1.5 text-xs rounded-lg font-semibold transition flex items-center gap-1.5 cursor-pointer ${
              activeFilter === 'fully_paid'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-emerald-900 hover:bg-emerald-50 border border-emerald-300'
            }`}
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-500" /> 100% Quitado ({validData.filter((p) => p.pendingAmount <= 0).length})
          </button>
        </div>
      </div>

      {/* Banner indicating Edit Mode on Table */}
      {isEditMode && (
        <div id="table-edit-mode-info-banner" className="mx-4 sm:mx-5 mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs animate-fade-in">
          <div className="flex items-center gap-2 text-emerald-950 font-semibold">
            <Calculator className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>
              <strong>Todos os campos são editáveis:</strong> altere nomes, categorias, valores previstos, parcelas ou pagamentos diretamente nas células. As somas e os saldos recalculam na hora e salvam automaticamente!
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-bold text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-300 flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-600" /> Auto-Salvar Ativo
            </span>
          </div>
        </div>
      )}

      {/* Saldo em Conta banner when 100% Quitado is active */}
      {!isEditMode && activeFilter === 'fully_paid' && (
        <div id="table-fully-paid-saldo-banner" className="mx-4 sm:mx-5 mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-emerald-950 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Exibindo todos os {filteredData.length} participantes 100% quitados (total arrecadado deste grupo: {formatCurrency(filteredData.reduce((acc, curr) => acc + curr.paidAmount, 0))})
            </span>
          </div>
          <div className="bg-white px-3 py-1 rounded-lg border border-emerald-300 font-bold text-emerald-900 flex items-center gap-1.5 shadow-2xs self-start sm:self-auto">
            <span className="text-slate-600">Saldo Atual em Conta Bancária (Caixa):</span>
            <span className="text-emerald-700 font-extrabold text-sm">{formatCurrency(saldoEmConta)}</span>
          </div>
        </div>
      )}

      {/* Table for Desktop & Tablet */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse min-w-[900px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-100/90 text-slate-700 text-xs uppercase font-bold tracking-wider">
              <th className="py-3.5 px-4 sm:px-6 w-[220px]">Participante</th>
              <th className="py-3.5 px-3 text-slate-800 w-[150px]">Valor por Pessoa</th>
              <th className="py-3.5 px-3 bg-amber-50/70 border-x border-amber-200/80 text-amber-950 w-[170px]">
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-amber-700" />
                  <span>1ª Parcela: Reserva</span>
                </div>
              </th>
              <th className="py-3.5 px-3 bg-sky-50/70 border-r border-sky-200/80 text-sky-950 w-[170px]">
                <div className="flex items-center gap-1.5">
                  <UtensilsCrossed className="w-3.5 h-3.5 text-sky-700" />
                  <span>2ª Parcela: Alim.</span>
                </div>
              </th>
              <th className="py-3.5 px-3 text-emerald-800 w-[160px]">Total Já Pago</th>
              <th className="py-3.5 px-3 text-slate-800 w-[170px]">Situação / Saldo</th>
              <th className="py-3.5 px-4 sm:px-6 text-right w-[110px]">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {sortedData.map((person) => {
              const b = getPersonDeadlineBreakdown(person);
              const isFullyPaid = person.pendingAmount <= 0;
              const isEditedJustNow = recentlyEditedId === person.id;

              return (
                <tr
                  key={person.id}
                  id={`person-row-${person.id}`}
                  className={`hover:bg-slate-50 transition group ${
                    isFullyPaid ? 'bg-emerald-50/30' : ''
                  } ${isEditedJustNow ? 'bg-emerald-100/50' : ''}`}
                >
                  {/* Nome & Categoria */}
                  <td className="py-3.5 px-4 sm:px-6">
                    {isEditMode ? (
                      <div className="space-y-1.5">
                        <input
                          type="text"
                          value={person.name}
                          onChange={(e) => handleCellChange(person.id, 'name', e.target.value)}
                          className="w-full text-xs font-bold text-slate-900 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                          placeholder="Nome..."
                        />
                        <select
                          value={person.category}
                          onChange={(e) => handleCellChange(person.id, 'category', e.target.value)}
                          className="w-full text-[11px] font-medium text-slate-700 bg-white border border-slate-300 rounded-lg px-2 py-1 outline-none focus:border-emerald-500 cursor-pointer"
                        >
                          <option value="adulto">Adulto</option>
                          <option value="crianca_outros">Criança / Outros</option>
                        </select>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                            isFullyPaid
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : b.isReservePaid
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-slate-100 text-slate-700 border border-slate-300'
                          }`}
                        >
                          {person.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                            <span>{person.name}</span>
                            {person.name.includes('Vaga') && (
                              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-semibold border border-slate-300">
                                DISPONÍVEL
                              </span>
                            )}
                            {isFullyPaid && !person.name.includes('Vaga') && (
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold border border-emerald-300">
                                QUITADO
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {getCategoryBadge(person.category)}
                          </div>
                        </div>
                      </div>
                    )}
                  </td>

                  {/* Valor Total Previsto por Pessoa */}
                  <td className="py-3.5 px-3">
                    {isEditMode ? (
                      <div>
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">R$</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={person.totalExpected}
                            onChange={(e) => handleCellChange(person.id, 'totalExpected', e.target.value)}
                            className="w-full text-xs font-extrabold text-slate-900 bg-white border border-slate-300 rounded-lg pl-7 pr-2 py-1.5 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                            title="Total Previsto do Participante"
                          />
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                          {person.expectedReserve} res. + {person.expectedFood} alim.
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="font-bold text-slate-900 text-sm">
                          {formatCurrency(person.totalExpected)}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {person.expectedReserve > 0
                            ? `R$ ${person.expectedReserve} res. + R$ ${person.expectedFood} alim.`
                            : `R$ ${person.expectedFood} alim.`}
                        </div>
                      </div>
                    )}
                  </td>

                  {/* 1ª Parcela: Reserva (10/09) */}
                  <td className="py-3.5 px-3 bg-amber-50/40 border-x border-amber-100">
                    {isEditMode ? (
                      <div>
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-700">R$</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={person.expectedReserve}
                            onChange={(e) => handleCellChange(person.id, 'expectedReserve', e.target.value)}
                            className="w-full text-xs font-bold text-amber-950 bg-white border border-amber-300 rounded-lg pl-7 pr-2 py-1.5 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                            title="1ª Parcela: Reserva"
                          />
                        </div>
                        <div className="text-[10px] mt-0.5">
                          {b.isReservePaid ? (
                            <span className="text-emerald-700 font-bold">✓ Quitado</span>
                          ) : (
                            <span className="text-amber-800">Falta {formatCurrency(b.pendingReserve)}</span>
                          )}
                        </div>
                      </div>
                    ) : b.reserveExpected > 0 ? (
                      b.isReservePaid ? (
                        <div className="text-xs">
                          <span className="inline-flex items-center gap-1 text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <Check className="w-3 h-3 text-emerald-600" /> Quitado ({formatCurrency(b.reserveExpected)})
                          </span>
                        </div>
                      ) : (
                        <div>
                          <div className="font-bold text-amber-800 text-sm">
                            Falta {formatCurrency(b.pendingReserve)}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Pago {formatCurrency(b.paidForReserve)} de {formatCurrency(b.reserveExpected)}
                          </div>
                        </div>
                      )
                    ) : (
                      <span className="text-xs text-slate-400 italic">Isento (R$ 0,00)</span>
                    )}
                  </td>

                  {/* 2ª Parcela: Alimentação (07/10) */}
                  <td className="py-3.5 px-3 bg-sky-50/40 border-r border-sky-100">
                    {isEditMode ? (
                      <div>
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-sky-700">R$</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={person.expectedFood}
                            onChange={(e) => handleCellChange(person.id, 'expectedFood', e.target.value)}
                            className="w-full text-xs font-bold text-sky-950 bg-white border border-sky-300 rounded-lg pl-7 pr-2 py-1.5 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                            title="2ª Parcela: Alimentação"
                          />
                        </div>
                        <div className="text-[10px] mt-0.5">
                          {b.isFoodPaid ? (
                            <span className="text-emerald-700 font-bold">✓ Quitado</span>
                          ) : (
                            <span className="text-sky-800">Falta {formatCurrency(b.pendingFood)}</span>
                          )}
                        </div>
                      </div>
                    ) : b.isFoodPaid ? (
                      <div className="text-xs">
                        <span className="inline-flex items-center gap-1 text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <Check className="w-3 h-3 text-emerald-600" /> Quitado ({formatCurrency(b.foodExpected)})
                        </span>
                      </div>
                    ) : (
                      <div>
                        <div className="font-bold text-sky-800 text-sm">
                          Falta {formatCurrency(b.pendingFood)}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Pago {formatCurrency(b.paidForFood)} de {formatCurrency(b.foodExpected)}
                        </div>
                      </div>
                    )}
                  </td>

                  {/* Valor Total Já Pago */}
                  <td className="py-3.5 px-3">
                    {isEditMode ? (
                      <div className="space-y-1">
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-700">R$</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={person.paidAmount}
                            onChange={(e) => handleCellChange(person.id, 'paidAmount', e.target.value)}
                            className="w-full text-xs font-black text-emerald-950 bg-white border border-emerald-300 rounded-lg pl-7 pr-2 py-1.5 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                            title="Valor Total Efetivamente Pago"
                          />
                        </div>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => handleCellChange(person.id, 'status', 'quitado')}
                            className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition cursor-pointer"
                            title="Definir valor pago igual ao total previsto"
                          >
                            + Quitar
                          </button>
                          {person.paidAmount > 0 && (
                            <button
                              type="button"
                              onClick={() => handleCellChange(person.id, 'paidAmount', 0)}
                              className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 transition cursor-pointer"
                              title="Zerar valor pago"
                            >
                              Zerar
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="font-bold text-emerald-700 text-sm">
                        {formatCurrency(person.paidAmount)}
                      </div>
                    )}
                  </td>

                  {/* Valor Pendente / Saldo Individual */}
                  <td className="py-3.5 px-3">
                    {isEditMode ? (
                      <div className="space-y-1">
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">R$</span>
                          <input
                            type="number"
                            step="0.01"
                            value={person.pendingAmount}
                            onChange={(e) => handleCellChange(person.id, 'pendingAmount', e.target.value)}
                            className={`w-full text-xs font-black bg-white border rounded-lg pl-7 pr-2 py-1.5 outline-none ${
                              isFullyPaid
                                ? 'border-emerald-300 text-emerald-700'
                                : 'border-rose-300 text-rose-700'
                            }`}
                            title="Valor Pendente (ajusta o valor pago automaticamente)"
                          />
                        </div>
                        <div className="text-[10px] font-bold">
                          {person.pendingAmount < 0 ? (
                            <span className="text-emerald-700">Crédito (+{formatCurrency(Math.abs(person.pendingAmount))})</span>
                          ) : isFullyPaid ? (
                            <span className="text-emerald-700 flex items-center gap-0.5">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Quitado
                            </span>
                          ) : (
                            <span className="text-rose-700">
                              {((person.paidAmount / (person.totalExpected || 1)) * 100).toFixed(0)}% pago
                            </span>
                          )}
                        </div>
                      </div>
                    ) : person.pendingAmount < 0 ? (
                      <div>
                        <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Quitado
                        </span>
                        <span className="inline-flex items-center text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-1.5 py-0.5 rounded mt-0.5">
                          Crédito: +{formatCurrency(Math.abs(person.pendingAmount))}
                        </span>
                      </div>
                    ) : isFullyPaid ? (
                      <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Quitado
                      </span>
                    ) : (
                      <div>
                        <span className="font-bold text-rose-700 text-sm">
                          {formatCurrency(person.pendingAmount)}
                        </span>
                        <div className="text-[10px] text-slate-500 font-medium">
                          {((person.paidAmount / (person.totalExpected || 1)) * 100).toFixed(0)}% pago
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
                        className={`p-1.5 rounded-lg border transition cursor-pointer ${
                          copiedId === person.id
                            ? 'bg-emerald-100 border-emerald-400 text-emerald-800'
                            : 'bg-white border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        {copiedId === person.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>

                      {/* Edit / Pay Modal */}
                      <button
                        type="button"
                        id={`edit-pay-btn-${person.id}`}
                        onClick={() => onEditPerson(person)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-1 transition shadow-2xs cursor-pointer ${
                          isEditMode
                            ? 'bg-slate-900 hover:bg-black text-white border-slate-900'
                            : 'bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 border-slate-300 hover:border-emerald-400'
                        }`}
                        title={`Editar todos os campos e detalhes de ${person.name}`}
                      >
                        <Edit3 className="w-3 h-3 text-emerald-400" />
                        <span className="hidden sm:inline">{isEditMode ? 'Detalhes' : 'Editar'}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {sortedData.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  Nenhum participante encontrado com os filtros selecionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer summary */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between text-xs text-slate-600 gap-3">
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <span>
            Mostrando <strong className="text-slate-900">{sortedData.length}</strong> de <strong className="text-slate-900">{data.length}</strong>
          </span>
          <span>
            Previsto do Grupo: <strong className="text-slate-900 font-bold">{formatCurrency(sortedData.reduce((acc, c) => acc + c.totalExpected, 0))}</strong>
          </span>
          <span>
            Já Arrecadado: <strong className="text-emerald-700 font-bold">{formatCurrency(sortedData.reduce((acc, c) => acc + c.paidAmount, 0))}</strong>
          </span>
          <span>
            Reserva (10/09): <strong className="text-emerald-700 font-bold">100% Paga</strong>
          </span>
          <span>
            Falta Alimentação (07/10): <strong className="text-sky-700 font-bold">{formatCurrency(sortedData.reduce((acc, c) => acc + getPersonDeadlineBreakdown(c).pendingFood, 0))}</strong>
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span>
            Saldo em Caixa (Banco): <strong className="text-amber-800 font-bold">{formatCurrency(saldoEmConta)}</strong>
          </span>
          <span>
            Pendente a Receber: <strong className="text-rose-700 font-bold">{formatCurrency(sortedData.filter((c) => c.pendingAmount > 0).reduce((acc, c) => acc + c.pendingAmount, 0))}</strong>
          </span>
        </div>
      </div>
    </div>
  );
};
