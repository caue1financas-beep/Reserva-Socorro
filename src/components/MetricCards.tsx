import React from 'react';
import { Calendar, CheckCircle2, AlertCircle, Users, UtensilsCrossed, Building2 } from 'lucide-react';
import { PersonDebt } from '../types';
import { formatCurrency, getPersonDeadlineBreakdown } from '../utils/formatters';

interface MetricCardsProps {
  data: PersonDebt[];
}

export const MetricCards: React.FC<MetricCardsProps> = ({ data }) => {
  const breakdowns = data.map((p) => getPersonDeadlineBreakdown(p));

  const totalExpectedReserve = data.reduce((acc, curr) => acc + curr.expectedReserve, 0);
  const totalPaidReserve = breakdowns.reduce((acc, curr) => acc + curr.paidForReserve, 0);
  const totalPendingReserve = breakdowns.reduce((acc, curr) => acc + curr.pendingReserve, 0);
  const percentReserve = totalExpectedReserve > 0 ? (totalPaidReserve / totalExpectedReserve) * 100 : 0;

  const totalExpectedFood = data.reduce((acc, curr) => acc + curr.expectedFood, 0);
  const totalPaidFood = breakdowns.reduce((acc, curr) => acc + curr.paidForFood, 0);
  const totalPendingFood = breakdowns.reduce((acc, curr) => acc + curr.pendingFood, 0);
  const percentFood = totalExpectedFood > 0 ? (totalPaidFood / totalExpectedFood) * 100 : 0;

  const totalExpected = data.reduce((acc, curr) => acc + curr.totalExpected, 0);
  const totalPaid = data.reduce((acc, curr) => acc + curr.paidAmount, 0);
  const totalPending = data.reduce((acc, curr) => acc + curr.pendingAmount, 0);

  const reservePaidPeople = breakdowns.filter((b) => b.isReservePaid && b.reserveExpected > 0).length;
  const reservePendingPeople = breakdowns.filter((b) => b.pendingReserve > 0).length;

  return (
    <div className="space-y-4">
      {/* Two Deadlines Hero Banner Cards */}
      <div id="deadline-cards-row" className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: 1ª Parcela - Reserva (10/09) */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 border-2 border-amber-500/40 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] uppercase font-bold tracking-wider text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/60 inline-flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Vence em 10/09
                </span>
                <h3 className="text-base font-bold text-white mt-1">1ª Parcela: RESERVA (R$ 188/ad)</h3>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Falta arrecadar</span>
              <span className="text-2xl sm:text-3xl font-black text-amber-400 tracking-tight">
                {formatCurrency(totalPendingReserve)}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-xs">
            <div>
              <span className="text-slate-500 block text-[11px]">Total Reserva:</span>
              <span className="font-semibold text-slate-200">{formatCurrency(totalExpectedReserve)}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Já Arrecadado:</span>
              <span className="font-bold text-emerald-400">{formatCurrency(totalPaidReserve)}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Progresso:</span>
              <span className="font-bold text-amber-400">{percentReserve.toFixed(1)}%</span>
            </div>
          </div>

          <div className="w-full bg-slate-950 rounded-full h-2 mt-3 overflow-hidden border border-slate-800">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${percentReserve}%` }}
            ></div>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>{reservePendingPeople} pessoas com reserva pendente</span>
            <span>{reservePaidPeople} adultos já quitaram</span>
          </div>
        </div>

        {/* Card 2: 2ª Parcela - Alimentação (07/10) */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] uppercase font-bold tracking-wider text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/60 inline-flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Vence em 07/10
                </span>
                <h3 className="text-base font-bold text-white mt-1">2ª Parcela: ALIMENTAÇÃO</h3>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Falta arrecadar</span>
              <span className="text-2xl sm:text-3xl font-bold text-cyan-400 tracking-tight">
                {formatCurrency(totalPendingFood)}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-xs">
            <div>
              <span className="text-slate-500 block text-[11px]">Total Alimentação:</span>
              <span className="font-semibold text-slate-200">{formatCurrency(totalExpectedFood)}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Já Arrecadado:</span>
              <span className="font-bold text-emerald-400">{formatCurrency(totalPaidFood)}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Progresso:</span>
              <span className="font-bold text-cyan-400">{percentFood.toFixed(1)}%</span>
            </div>
          </div>

          <div className="w-full bg-slate-950 rounded-full h-2 mt-3 overflow-hidden border border-slate-800">
            <div
              className="bg-cyan-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${percentFood}%` }}
            ></div>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>R$ 120/adulto e R$ 30/criança</span>
            <span>Prazo: até 07/10</span>
          </div>
        </div>
      </div>

      {/* Quick Status Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4">
          <span className="text-slate-400 font-medium">Balanço Consolidado:</span>
          <span className="text-white">
            Previsto: <strong className="font-bold">{formatCurrency(totalExpected)}</strong>
          </span>
          <span className="text-emerald-400">
            Arrecadado: <strong className="font-bold">{formatCurrency(totalPaid)}</strong>
          </span>
          <span className="text-rose-400">
            Pendente Geral: <strong className="font-bold">{formatCurrency(totalPending)}</strong>
          </span>
        </div>
        <div className="text-slate-400 text-[11px]">
          Total de <strong>{data.length}</strong> participantes cadastrados
        </div>
      </div>
    </div>
  );
};

