import React, { useState } from 'react';
import { Wallet, ArrowDownRight, ArrowUpRight, DollarSign, Calculator, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import { PersonDebt } from '../types';
import {
  formatCurrency,
  ADVANCE_RESERVE_EXPENSE,
  SETTLEMENT_RESERVE_EXPENSE,
  TOTAL_RESERVE_EXPENSES,
  OFFICIAL_RESERVE_TARGET,
} from '../utils/formatters';

interface CashFlowCardProps {
  data: PersonDebt[];
}

export const CashFlowCard: React.FC<CashFlowCardProps> = ({ data }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Cálculos financeiros reais baseados na planilha
  const totalArrecadado = data.reduce((acc, curr) => acc + curr.paidAmount, 0); // R$ 2.624,00
  const totalGastos = TOTAL_RESERVE_EXPENSES; // R$ 2.500,00 (Adiantamento R$ 500 + Quitação R$ 2.000)
  const saldoEmConta = totalArrecadado - totalGastos; // R$ 124,00

  const totalAdultos = data.filter((p) => p.category === 'adulto').length;

  return (
    <div
      id="cashflow-summary-card"
      className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm relative overflow-hidden"
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                Fluxo de Caixa & Saldo em Conta
              </h3>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-300">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Reserva 100% Quitada com o Imóvel
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Adiantamento (R$ 500) + Quitação (R$ 2.000) pagos. Saldo restante em conta disponível para alimentação.
            </p>
          </div>
        </div>

        {/* Big Saldo Badge */}
        <div className="flex items-center gap-3">
          <div className="bg-amber-50 px-4 py-2 rounded-xl border-2 border-amber-300 flex items-center gap-2.5 shadow-2xs">
            <span className="text-xs font-semibold text-amber-900">Saldo em Conta:</span>
            <span className="text-xl font-black text-amber-800 tracking-tight">
              {formatCurrency(saldoEmConta)}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition"
            title={isExpanded ? 'Recolher tabela' : 'Expandir tabela'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Table Section matching user's spreadsheet */}
      {isExpanded && (
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-300 shadow-2xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#286090] text-white font-bold uppercase tracking-wider">
                <th className="py-2.5 px-4">Descrição</th>
                <th className="py-2.5 px-4 text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 text-slate-800 font-medium">
              {/* Adiantamento Pago reserva */}
              <tr className="bg-[#fce5e5] hover:bg-rose-100/70 transition">
                <td className="py-2.5 px-4 flex items-center gap-2 text-rose-950 font-semibold">
                  <ArrowDownRight className="w-3.5 h-3.5 text-rose-700 shrink-0" />
                  <span>Adiantamento Pago reserva</span>
                </td>
                <td className="py-2.5 px-4 text-right font-bold text-rose-800">
                  {formatCurrency(ADVANCE_RESERVE_EXPENSE)}
                </td>
              </tr>

              {/* Quitação reserva */}
              <tr className="bg-[#fce5e5] hover:bg-rose-100/70 transition">
                <td className="py-2.5 px-4 flex items-center gap-2 text-rose-950 font-semibold">
                  <ArrowDownRight className="w-3.5 h-3.5 text-rose-700 shrink-0" />
                  <span>Quitação reserva</span>
                </td>
                <td className="py-2.5 px-4 text-right font-bold text-rose-800">
                  {formatCurrency(SETTLEMENT_RESERVE_EXPENSE)}
                </td>
              </tr>

              {/* Total de gastos */}
              <tr className="bg-[#fff2cc] text-amber-950 font-bold border-y border-amber-300">
                <td className="py-2.5 px-4">Total de gastos</td>
                <td className="py-2.5 px-4 text-right font-black text-amber-900">
                  {formatCurrency(totalGastos)}
                </td>
              </tr>

              {/* Valores arrecadados */}
              <tr className="bg-[#d9ead3] text-emerald-950 font-semibold">
                <td className="py-2.5 px-4 flex items-center gap-2">
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span>Valores arrecadados</span>
                </td>
                <td className="py-2.5 px-4 text-right font-black text-emerald-800">
                  {formatCurrency(totalArrecadado)}
                </td>
              </tr>

              {/* Saldo em conta */}
              <tr className="bg-[#ffe599] text-amber-950 font-bold text-sm border-t-2 border-amber-400">
                <td className="py-3 px-4 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-amber-800 shrink-0" />
                  <span>Saldo em conta</span>
                </td>
                <td className="py-3 px-4 text-right font-black text-amber-950 text-base">
                  {formatCurrency(saldoEmConta)}
                </td>
              </tr>

              {/* Rateio por pessoa */}
              <tr className="bg-[#f6b26b] text-slate-900 font-semibold">
                <td className="py-2.5 px-4 flex items-center gap-2">
                  <Calculator className="w-3.5 h-3.5 text-slate-900 shrink-0" />
                  <div>
                    <span className="font-bold">Rateio por pessoa</span>
                    <p className="text-[11px] text-slate-800 font-normal">
                      {totalAdultos} adultos a R$ 188,00 na reserva ({formatCurrency(totalAdultos * 188)}) + R$ 120,00 na alimentação
                    </p>
                  </div>
                </td>
                <td className="py-2.5 px-4 text-right">
                  <span className="font-black text-slate-950 text-sm">R$ 188,00</span>
                  <span className="block text-[10px] text-slate-800 font-medium">reserva fixada</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
