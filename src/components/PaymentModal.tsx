import React, { useState } from 'react';
import { X, Check, Calendar, Building2, UtensilsCrossed } from 'lucide-react';
import { PersonDebt } from '../types';
import { formatCurrency } from '../utils/formatters';

interface PaymentModalProps {
  person: PersonDebt | null;
  onClose: () => void;
  onSavePayment: (personId: string, newPaidAmount: number, notes?: string) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ person, onClose, onSavePayment }) => {
  if (!person) return null;

  const [paidInput, setPaidInput] = useState<string>(person.paidAmount.toString());
  const [notes, setNotes] = useState<string>(person.notes || '');

  const numericPaid = parseFloat(paidInput) || 0;
  const newPending = Math.max(0, person.totalExpected - numericPaid);
  const isOverpaid = numericPaid > person.totalExpected;

  // Breakdown for simulated payment
  const simReservePaid = Math.min(numericPaid, person.expectedReserve);
  const simReservePending = Math.max(0, person.expectedReserve - numericPaid);
  const simFoodPaid = Math.min(person.expectedFood, Math.max(0, numericPaid - person.expectedReserve));
  const simFoodPending = Math.max(0, person.expectedFood - simFoodPaid);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSavePayment(person.id, numericPaid, notes);
    onClose();
  };

  const setFullPayment = () => {
    setPaidInput(person.totalExpected.toString());
  };

  const setReserveOnlyPayment = () => {
    setPaidInput(person.expectedReserve.toString());
  };

  const addAmount = (val: number) => {
    const current = parseFloat(paidInput) || 0;
    setPaidInput((current + val).toString());
  };

  return (
    <div id="payment-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div id="payment-modal-card" className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div>
            <span className="text-xs uppercase font-semibold text-emerald-400 tracking-wider">Registrar Pagamento</span>
            <h3 className="text-lg font-bold text-white mt-0.5">{person.name}</h3>
          </div>
          <button
            id="close-payment-modal-btn"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Summary Box by Deadlines */}
          <div className="bg-slate-950/80 rounded-xl p-3.5 border border-slate-800 text-xs space-y-2.5">
            <div className="flex justify-between items-center text-slate-300 font-semibold border-b border-slate-800/80 pb-1.5">
              <span>Total do Pacote:</span>
              <span className="text-sm font-bold text-white">{formatCurrency(person.totalExpected)}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-0.5">
              <div className="bg-amber-950/30 border border-amber-900/40 rounded-lg p-2">
                <span className="text-[10px] text-amber-400 font-bold uppercase block flex items-center gap-1">
                  <Calendar className="w-2.5 h-2.5" /> 10/09 Reserva
                </span>
                <span className="text-xs font-semibold text-slate-200 block mt-0.5">
                  {person.expectedReserve > 0 ? formatCurrency(person.expectedReserve) : 'Isento (R$ 0)'}
                </span>
              </div>
              <div className="bg-cyan-950/30 border border-cyan-900/40 rounded-lg p-2">
                <span className="text-[10px] text-cyan-400 font-bold uppercase block flex items-center gap-1">
                  <Calendar className="w-2.5 h-2.5" /> 07/10 Alimentação
                </span>
                <span className="text-xs font-semibold text-slate-200 block mt-0.5">
                  {formatCurrency(person.expectedFood)}
                </span>
              </div>
            </div>

            <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-800/80 text-[11px]">
              <span>Pago atualmente: <strong className="text-emerald-400">{formatCurrency(person.paidAmount)}</strong></span>
              <span>Falta pagar: <strong className="text-rose-400">{formatCurrency(person.pendingAmount)}</strong></span>
            </div>
          </div>

          {/* New Payment Value Input */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
              Novo Valor Total Pago Acumulado (R$)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <span className="font-bold text-sm">R$</span>
              </div>
              <input
                id="payment-amount-input"
                type="number"
                step="any"
                min="0"
                value={paidInput}
                onChange={(e) => setPaidInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 pl-10 pr-3 text-white text-lg font-bold focus:outline-none focus:border-emerald-500 transition"
                required
                autoFocus
              />
            </div>
          </div>

          {/* Quick Buttons */}
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {person.expectedReserve > 0 && (
              <button
                type="button"
                id="btn-quick-reserve-pay"
                onClick={setReserveOnlyPayment}
                className="text-xs bg-amber-950 hover:bg-amber-900 border border-amber-700/60 text-amber-300 font-medium px-2.5 py-1.5 rounded-lg transition flex items-center gap-1"
              >
                <Building2 className="w-3 h-3" /> Quitar Reserva ({formatCurrency(person.expectedReserve)})
              </button>
            )}
            <button
              type="button"
              id="btn-quick-full-pay"
              onClick={setFullPayment}
              className="text-xs bg-emerald-950 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 font-medium px-2.5 py-1.5 rounded-lg transition flex items-center gap-1"
            >
              <Check className="w-3 h-3" /> Quitar Tudo ({formatCurrency(person.totalExpected)})
            </button>
            <button
              type="button"
              id="btn-quick-add-50"
              onClick={() => addAmount(50)}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium px-2 py-1.5 rounded-lg transition"
            >
              + R$ 50
            </button>
            <button
              type="button"
              id="btn-quick-add-100"
              onClick={() => addAmount(100)}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium px-2 py-1.5 rounded-lg transition"
            >
              + R$ 100
            </button>
          </div>

          {/* Live impact on deadlines */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5 text-xs">
            <span className="text-slate-400 font-semibold block text-[11px]">Resultado com este valor:</span>
            <div className="flex justify-between items-center">
              <span className="text-slate-300">🏨 1ª Parcela (Reserva - 10/09):</span>
              <span className={simReservePending === 0 ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                {simReservePending === 0 ? '✅ Quitado' : `Falta ${formatCurrency(simReservePending)}`}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-300">🍽️ 2ª Parcela (Alimentação - 07/10):</span>
              <span className={simFoodPending === 0 ? 'text-emerald-400 font-bold' : 'text-cyan-400 font-bold'}>
                {simFoodPending === 0 ? '✅ Quitado' : `Falta ${formatCurrency(simFoodPending)}`}
              </span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-slate-800/80 font-bold">
              <span className="text-slate-200">Saldo Pendente Geral:</span>
              <span className={newPending === 0 ? 'text-emerald-400' : 'text-rose-400'}>
                {newPending === 0 ? '✨ 100% Quitado' : formatCurrency(newPending)}
              </span>
            </div>
          </div>

          {isOverpaid && (
            <p className="text-xs text-amber-400 bg-amber-950/40 border border-amber-800/40 p-2 rounded-lg">
              ⚠️ O valor informado é maior que o total previsto ({formatCurrency(numericPaid - person.totalExpected)} a mais).
            </p>
          )}

          {/* Optional Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Observação / Comprovante (opcional)
            </label>
            <input
              id="payment-notes-input"
              type="text"
              placeholder="Ex: Pix recebido em 27/08"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-slate-200 text-xs focus:outline-none focus:border-slate-600"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              id="btn-cancel-modal"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              id="btn-confirm-payment"
              className="px-5 py-2 text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-900/30 transition flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" /> Salvar Alteração
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
