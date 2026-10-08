import React, { useState } from 'react';
import { X, UserPlus, Check, Calculator } from 'lucide-react';
import { PersonDebt } from '../types';
import { formatCurrency } from '../utils/formatters';
import { parseMoneyValue } from '../utils/calculations';

interface AddPersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (newPerson: Omit<PersonDebt, 'id'>) => void;
}

export const AddPersonModal: React.FC<AddPersonModalProps> = ({ isOpen, onClose, onAdd }) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [category, setCategory] = useState<'adulto' | 'crianca_outros'>('adulto');
  const [expectedReserve, setExpectedReserve] = useState('188');
  const [expectedFood, setExpectedFood] = useState('120');
  const [totalExpected, setTotalExpected] = useState('308');
  const [paidAmount, setPaidAmount] = useState('0');
  const [pendingAmount, setPendingAmount] = useState('308');
  const [notes, setNotes] = useState('');

  const handleCategoryChange = (cat: 'adulto' | 'crianca_outros') => {
    setCategory(cat);
    if (cat === 'adulto') {
      setExpectedReserve('188');
      setExpectedFood('120');
      setTotalExpected('308');
      const paid = parseMoneyValue(paidAmount);
      setPendingAmount(Math.max(0, 308 - paid).toString());
    } else {
      setExpectedReserve('0');
      setExpectedFood('30');
      setTotalExpected('30');
      const paid = parseMoneyValue(paidAmount);
      setPendingAmount(Math.max(0, 30 - paid).toString());
    }
  };

  const handleReserveChange = (val: string) => {
    setExpectedReserve(val);
    const r = parseMoneyValue(val);
    const f = parseMoneyValue(expectedFood);
    const tot = r + f;
    setTotalExpected(tot.toString());
    const paid = parseMoneyValue(paidAmount);
    setPendingAmount((tot - paid).toString());
  };

  const handleFoodChange = (val: string) => {
    setExpectedFood(val);
    const r = parseMoneyValue(expectedReserve);
    const f = parseMoneyValue(val);
    const tot = r + f;
    setTotalExpected(tot.toString());
    const paid = parseMoneyValue(paidAmount);
    setPendingAmount((tot - paid).toString());
  };

  const handleTotalChange = (val: string) => {
    setTotalExpected(val);
    const tot = parseMoneyValue(val);
    const r = parseMoneyValue(expectedReserve);
    if (r > 0 && tot >= r) {
      setExpectedFood((tot - r).toString());
    } else {
      setExpectedReserve('0');
      setExpectedFood(tot.toString());
    }
    const paid = parseMoneyValue(paidAmount);
    setPendingAmount((tot - paid).toString());
  };

  const handlePaidChange = (val: string) => {
    setPaidAmount(val);
    const paid = parseMoneyValue(val);
    const tot = parseMoneyValue(totalExpected);
    setPendingAmount((tot - paid).toString());
  };

  const handlePendingChange = (val: string) => {
    setPendingAmount(val);
    const pend = parseMoneyValue(val);
    const tot = parseMoneyValue(totalExpected);
    setPaidAmount(Math.max(0, tot - pend).toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const reserve = parseMoneyValue(expectedReserve);
    const food = parseMoneyValue(expectedFood);
    const total = parseMoneyValue(totalExpected) || (reserve + food);
    const paid = parseMoneyValue(paidAmount);
    const pending = total - paid;

    let status: 'quitado' | 'parcial' | 'pendente_total' = 'pendente_total';
    if (pending <= 0) status = 'quitado';
    else if (paid > 0) status = 'parcial';

    onAdd({
      name: name.trim(),
      category,
      expectedReserve: reserve,
      expectedFood: food,
      totalExpected: total,
      paidAmount: paid,
      pendingAmount: pending,
      status,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <div id="add-person-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div id="add-person-modal-card" className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-emerald-700" />
            <h3 className="text-base font-bold text-slate-900">Adicionar Novo Participante</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-lg hover:bg-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[85vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
              Nome do Participante
            </label>
            <input
              id="new-person-name"
              type="text"
              required
              placeholder="Ex: Gabriel"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl py-2 px-3 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 font-semibold"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
              Categoria / Pacote Predefinido
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleCategoryChange('adulto')}
                className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                  category === 'adulto'
                    ? 'bg-emerald-50/80 border-emerald-500 text-slate-900 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="font-bold text-xs text-slate-900">Adulto</div>
                <div className="text-[11px] text-slate-500">Padrão: R$ 308 (188+120)</div>
              </button>
              <button
                type="button"
                onClick={() => handleCategoryChange('crianca_outros')}
                className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                  category === 'crianca_outros'
                    ? 'bg-cyan-50/80 border-cyan-500 text-slate-900 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="font-bold text-xs text-slate-900">Criança / Taxa</div>
                <div className="text-[11px] text-slate-500">Padrão: R$ 30 (Alimentação)</div>
              </button>
            </div>
          </div>

          {/* Campos editáveis com cálculo */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
              <Calculator className="w-3.5 h-3.5 text-emerald-600" /> Valores do Participante (Editáveis)
            </span>

            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-amber-900 mb-1">
                  1ª Parcela Reserva
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={expectedReserve}
                  onChange={(e) => handleReserveChange(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg py-1.5 px-2.5 text-slate-900 text-xs font-bold outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-sky-900 mb-1">
                  2ª Parcela Alim.
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={expectedFood}
                  onChange={(e) => handleFoodChange(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg py-1.5 px-2.5 text-slate-900 text-xs font-bold outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-900 mb-1">
                  Total Previsto
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={totalExpected}
                  onChange={(e) => handleTotalChange(e.target.value)}
                  className="w-full bg-white border border-emerald-400 rounded-lg py-1.5 px-2.5 text-emerald-950 text-xs font-black outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-emerald-900 mb-1">
                  Valor Já Pago (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={paidAmount}
                  onChange={(e) => handlePaidChange(e.target.value)}
                  className="w-full bg-white border border-emerald-300 rounded-lg py-1.5 px-2.5 text-emerald-900 text-xs font-bold outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Valor Pendente (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={pendingAmount}
                  onChange={(e) => handlePendingChange(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg py-1.5 px-2.5 text-rose-700 text-xs font-bold outline-none focus:border-rose-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Observações (opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: Convidado do Lucas"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl py-2 px-3 text-slate-800 text-xs focus:border-emerald-500 outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" /> Adicionar Participante
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
