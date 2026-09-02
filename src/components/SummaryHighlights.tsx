import React from 'react';
import { CheckCircle2, Calendar, UtensilsCrossed, Building2 } from 'lucide-react';
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
      <div className="bg-white border border-amber-200/80 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Falta Pagar da Reserva</h4>
              <span className="text-[11px] text-amber-700 font-medium flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Vence em 10/09
              </span>
            </div>
          </div>
          <span className="text-[11px] text-amber-800 font-bold bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
            {pendingReserveList.length} pessoas
          </span>
        </div>
        <div className="mt-3 space-y-2 max-h-72 overflow-y-auto pr-1">
          {pendingReserveList.map(({ person, b }) => (
            <div
              key={person.id}
              onClick={() => onOpenPaymentModal(person)}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-amber-50/70 border border-slate-200/80 hover:border-amber-300 cursor-pointer transition"
            >
              <div>
                <span className="text-sm font-bold text-slate-900">{person.name}</span>
                <p className="text-[11px] text-slate-500">
                  {b.paidForReserve === 0 ? 'Nenhum valor pago' : `Pago ${formatCurrency(b.paidForReserve)}`}
                </p>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-amber-700">
                  {formatCurrency(b.pendingReserve)}
                </span>
                <span className="block text-[10px] text-slate-400">até 10/09</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2ª Parcela: Alimentação (07/10) */}
      <div className="bg-white border border-sky-200/80 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Falta Alimentação</h4>
              <span className="text-[11px] text-sky-700 font-medium flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Vence em 07/10
              </span>
            </div>
          </div>
          <span className="text-[11px] text-sky-800 font-bold bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
            {pendingFoodList.length} pessoas
          </span>
        </div>
        <div className="mt-3 space-y-2 max-h-72 overflow-y-auto pr-1">
          {pendingFoodList.slice(0, 6).map(({ person, b }) => (
            <div
              key={person.id}
              onClick={() => onOpenPaymentModal(person)}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-sky-50/70 border border-slate-200/80 hover:border-sky-300 cursor-pointer transition"
            >
              <div>
                <span className="text-sm font-bold text-slate-900">{person.name}</span>
                <p className="text-[11px] text-slate-500">
                  {b.paidForFood === 0 ? 'Nenhum valor pago' : `Pago ${formatCurrency(b.paidForFood)}`}
                </p>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-sky-700">
                  {formatCurrency(b.pendingFood)}
                </span>
                <span className="block text-[10px] text-slate-400">até 07/10</span>
              </div>
            </div>
          ))}
          {pendingFoodList.length > 6 && (
            <p className="text-center text-[11px] text-slate-500 pt-1 font-medium">
              + {pendingFoodList.length - 6} pessoas na tabela completa
            </p>
          )}
        </div>
      </div>

      {/* Reserva Quitada (10/09) */}
      <div className="bg-white border border-emerald-200/80 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Reserva Quitada (10/09)</h4>
              <span className="text-[11px] text-emerald-700 font-medium">1ª Parcela em dia</span>
            </div>
          </div>
          <span className="text-[11px] text-emerald-800 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            {reservePaidList.length} pessoas
          </span>
        </div>
        <div className="mt-3 space-y-2 max-h-72 overflow-y-auto pr-1">
          {reservePaidList.map(({ person, b }) => (
            <div
              key={person.id}
              onClick={() => onOpenPaymentModal(person)}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-200/80 hover:border-emerald-300 cursor-pointer transition"
            >
              <div>
                <span className="text-sm font-bold text-slate-900">{person.name}</span>
                <p className="text-[11px] text-slate-500">
                  {person.pendingAmount === 0 ? '100% Tudo Quitado 🎉' : `Falta só alimentação (${formatCurrency(b.pendingFood)})`}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-emerald-700 flex items-center justify-end gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> OK (10/09)
                </span>
                <span className="text-[10px] text-slate-500">
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
