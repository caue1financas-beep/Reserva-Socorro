import React from 'react';
import { AlertCircle, CheckCircle2, Calendar, UtensilsCrossed, Building2 } from 'lucide-react';
import { PersonDebt } from '../types';
import { formatCurrency, getPersonDeadlineBreakdown } from '../utils/formatters';

interface SummaryHighlightsProps {
  data: PersonDebt[];
  onOpenPaymentModal: (person: PersonDebt) => void;
}

export const SummaryHighlights: React.FC<SummaryHighlightsProps> = ({ data, onOpenPaymentModal }) => {
  const itemsWithBreakdown = data.map((p) => ({
    person: p,
    b: getPersonDeadlineBreakdown(p),
  }));

  // Pessoas que faltam pagar a Reserva (10/09)
  const pendingReserveList = itemsWithBreakdown
    .filter((item) => item.b.pendingReserve > 0)
    .sort((a, b) => b.b.pendingReserve - a.b.pendingReserve);

  // Pessoas que faltam pagar Alimentação (07/10)
  const pendingFoodList = itemsWithBreakdown
    .filter((item) => item.b.pendingFood > 0)
    .sort((a, b) => b.b.pendingFood - a.b.pendingFood);

  // Pessoas com Reserva Quitada (10/09)
  const reservePaidList = itemsWithBreakdown.filter((item) => item.b.isReservePaid);

  return (
    <div id="summary-highlights-grid" className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* 1ª Parcela: Reserva (10/09) */}
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Falta Pagar da Reserva</h4>
              <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-1">
                <Calendar className="w-2.5 h-2.5" /> Vence em 10/09
              </span>
            </div>
          </div>
          <span className="text-[11px] text-amber-300 font-bold bg-amber-950 px-2 py-0.5 rounded-full border border-amber-900">
            {pendingReserveList.length} pessoas
          </span>
        </div>
        <div className="mt-3 space-y-2 max-h-72 overflow-y-auto pr-1">
          {pendingReserveList.map(({ person, b }) => (
            <div
              key={person.id}
              onClick={() => onOpenPaymentModal(person)}
              className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800/60 cursor-pointer transition"
            >
              <div>
                <span className="text-sm font-bold text-slate-100">{person.name}</span>
                <p className="text-[11px] text-slate-400">
                  {b.paidForReserve === 0 ? 'Nenhum valor pago' : `Pago ${formatCurrency(b.paidForReserve)}`}
                </p>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-amber-400">
                  {formatCurrency(b.pendingReserve)}
                </span>
                <span className="block text-[10px] text-slate-400">até 10/09</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2ª Parcela: Alimentação (07/10) */}
      <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Falta Alimentação</h4>
              <span className="text-[10px] text-cyan-400 font-semibold flex items-center gap-1">
                <Calendar className="w-2.5 h-2.5" /> Vence em 07/10
              </span>
            </div>
          </div>
          <span className="text-[11px] text-cyan-300 font-bold bg-cyan-950 px-2 py-0.5 rounded-full border border-cyan-900">
            {pendingFoodList.length} pessoas
          </span>
        </div>
        <div className="mt-3 space-y-2 max-h-72 overflow-y-auto pr-1">
          {pendingFoodList.slice(0, 6).map(({ person, b }) => (
            <div
              key={person.id}
              onClick={() => onOpenPaymentModal(person)}
              className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800/60 cursor-pointer transition"
            >
              <div>
                <span className="text-sm font-bold text-slate-100">{person.name}</span>
                <p className="text-[11px] text-slate-400">
                  {b.paidForFood === 0 ? 'Nenhum valor pago' : `Pago ${formatCurrency(b.paidForFood)}`}
                </p>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-cyan-400">
                  {formatCurrency(b.pendingFood)}
                </span>
                <span className="block text-[10px] text-slate-400">até 07/10</span>
              </div>
            </div>
          ))}
          {pendingFoodList.length > 6 && (
            <p className="text-center text-[11px] text-slate-500 pt-1">
              + {pendingFoodList.length - 6} pessoas na tabela completa
            </p>
          )}
        </div>
      </div>

      {/* Reserva Quitada (10/09) */}
      <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-950/80 border border-emerald-800/80 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Reserva Quitada (10/09)</h4>
              <span className="text-[10px] text-emerald-400 font-semibold">1ª Parcela em dia</span>
            </div>
          </div>
          <span className="text-[11px] text-emerald-300 font-bold bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-900">
            {reservePaidList.length} pessoas
          </span>
        </div>
        <div className="mt-3 space-y-2 max-h-72 overflow-y-auto pr-1">
          {reservePaidList.map(({ person, b }) => (
            <div
              key={person.id}
              onClick={() => onOpenPaymentModal(person)}
              className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800/60 cursor-pointer transition"
            >
              <div>
                <span className="text-sm font-bold text-slate-100">{person.name}</span>
                <p className="text-[11px] text-slate-400">
                  {person.pendingAmount === 0 ? '100% Tudo Quitado 🎉' : `Falta só alimentação (${formatCurrency(b.pendingFood)})`}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-emerald-400 flex items-center justify-end gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> OK (10/09)
                </span>
                <span className="text-[10px] text-slate-400">
                  Pago: {formatCurrency(person.paidAmount)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
