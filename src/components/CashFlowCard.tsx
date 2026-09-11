import React, { useState } from 'react';
import { Wallet, ArrowDownRight, ArrowUpRight, DollarSign, Calculator, ChevronDown, ChevronUp } from 'lucide-react';
import { PersonDebt } from '../types';
import { formatCurrency, ADVANCE_RESERVE_EXPENSE, OFFICIAL_RESERVE_TARGET } from '../utils/formatters';

interface CashFlowCardProps {
  data: PersonDebt[];
}

export const CashFlowCard: React.FC<CashFlowCardProps> = ({ data }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Cálculos financeiros reais
  const totalArrecadado = data.reduce((acc, curr) => acc + curr.paidAmount, 0);
  const totalGastos = ADVANCE_RESERVE_EXPENSE; // R$ 500,00 (Adiantamento pago reserva)
  const saldoEmConta = totalArrecadado - totalGastos; // R$ 810,00

  const totalAdultos = data.filter((p) => p.category === 'adulto').length;
  const rateioExato = totalAdultos > 0 ? OFFICIAL_RESERVE_TARGET / totalAdultos : 0;

  return (
    <div
      id="cashflow-summary-card"
      className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm relative overflow-hidden"
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              Fluxo de Caixa & Saldo em Conta
            </h3>
            <p className="text-xs text-slate-500">
              Controle de adiantamentos pagos, entradas de Pix e saldo disponível
            </p>
          </div>
        </div>

        {/* Big Saldo Badge */}
        <div className="flex items-center gap-3">
          <div className="bg-amber-50/80 px-3.5 py-1.5 rounded-xl border border-amber-200 flex items-center gap-2">
            <span className="text-xs font-medium text-amber-900">Saldo Atual em Conta:</span>
            <span className="text-lg font-black text-amber-700 tracking-tight">
              {formatCurrency(saldoEmConta)}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition"
            title={isExpanded ? 'Recolher tabela' : 'Expandir tabela'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Table Section */}
      {isExpanded && (
        <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold uppercase">
                <th className="py-2.5 px-4">Descrição</th>
                <th className="py-2.5 px-4 text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {/* Adiantamento */}
              <tr className="hover:bg-slate-50/60 transition">
                <td className="py-2.5 px-4 flex items-center gap-2 font-medium">
                  <ArrowDownRight className="w-3.5 h-3.5 text-rose-600" />
                  <span>Adiantamento Pago reserva</span>
                </td>
                <td className="py-2.5 px-4 text-right font-semibold text-rose-600">
                  - {formatCurrency(ADVANCE_RESERVE_EXPENSE)}
                </td>
              </tr>

              {/* Total de Gastos */}
              <tr className="bg-rose-50/70 font-semibold border-y border-rose-200/80">
                <td className="py-2.5 px-4 text-rose-900">Total de gastos</td>
                <td className="py-2.5 px-4 text-right text-rose-700 font-bold">
                  {formatCurrency(totalGastos)}
                </td>
              </tr>

              {/* Valores arrecadados */}
              <tr className="bg-emerald-50/70 font-semibold">
                <td className="py-2.5 px-4 flex items-center gap-2 text-emerald-900">
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Valores arrecadados (Total Pix recebido)</span>
                </td>
                <td className="py-2.5 px-4 text-right text-emerald-700 font-bold">
                  {formatCurrency(totalArrecadado)}
                </td>
              </tr>

              {/* Saldo em conta */}
              <tr className="bg-amber-100/70 font-bold text-sm border-t-2 border-amber-300">
                <td className="py-3 px-4 text-amber-950 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-amber-700" />
                  <span>Saldo em conta</span>
                </td>
                <td className="py-3 px-4 text-right text-amber-800 font-black">
                  {formatCurrency(saldoEmConta)}
                </td>
              </tr>

              {/* Rateio por pessoa */}
              <tr className="bg-slate-50 text-slate-600">
                <td className="py-2.5 px-4 flex items-center gap-2">
                  <Calculator className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <div>
                    <span>
                      Rateio Mantido: <strong className="text-slate-800">R$ 188,00</strong> por adulto ({totalAdultos} adultos = {formatCurrency(totalAdultos * 188)})
                    </span>
                    <p className="text-[11px] text-slate-400">
                      Diferença de {formatCurrency(Math.max(0, OFFICIAL_RESERVE_TARGET - totalAdultos * 188))} para a meta de {formatCurrency(OFFICIAL_RESERVE_TARGET)} será compensada na alimentação geral
                    </p>
                  </div>
                </td>
                <td className="py-2.5 px-4 text-right font-medium text-slate-800">
                  <span className="font-bold text-slate-950 text-sm">R$ 188,00</span>
                  <span className="block text-[10px] text-emerald-700 font-semibold">fixado</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
