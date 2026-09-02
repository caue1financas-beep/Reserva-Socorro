import React, { useState } from 'react';
import { X, UserPlus, Check } from 'lucide-react';
import { PersonDebt } from '../types';

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
  const [paidAmount, setPaidAmount] = useState('0');
  const [notes, setNotes] = useState('');

  const handleCategoryChange = (cat: 'adulto' | 'crianca_outros') => {
    setCategory(cat);
    if (cat === 'adulto') {
      setExpectedReserve('188');
      setExpectedFood('120');
    } else {
      setExpectedReserve('0');
      setExpectedFood('30');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const reserve = parseFloat(expectedReserve) || 0;
    const food = parseFloat(expectedFood) || 0;
    const total = reserve + food;
    const paid = parseFloat(paidAmount) || 0;
    const pending = Math.max(0, total - paid);

    let status: 'quitado' | 'parcial' | 'pendente_total' = 'pendente_total';
    if (pending === 0) status = 'quitado';
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
      <div id="add-person-modal-card" className="bg-white border border-slate-200 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-emerald-700" />
            <h3 className="text-lg font-bold text-slate-900">Adicionar Participante</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-lg hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
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
              className="w-full bg-white border border-slate-300 rounded-xl py-2.5 px-3 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 shadow-xs"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
              Categoria / Pacote
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleCategoryChange('adulto')}
                className={`p-3 rounded-xl border text-left transition ${
                  category === 'adulto'
                    ? 'bg-emerald-50/80 border-emerald-500 text-slate-900 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="font-bold text-xs text-slate-900">Adulto</div>
                <div className="text-[11px] text-slate-500">Total: R$ 308 (188+120)</div>
              </button>
              <button
                type="button"
                onClick={() => handleCategoryChange('crianca_outros')}
                className={`p-3 rounded-xl border text-left transition ${
                  category === 'crianca_outros'
                    ? 'bg-cyan-50/80 border-cyan-500 text-slate-900 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="font-bold text-xs text-slate-900">Criança / Taxa</div>
                <div className="text-[11px] text-slate-500">Total: R$ 30 (Alimentação)</div>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reserva (R$)
              </label>
              <input
                type="number"
                step="any"
                value={expectedReserve}
                onChange={(e) => setExpectedReserve(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl py-2 px-3 text-slate-900 text-xs focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Alimentação (R$)
              </label>
              <input
                type="number"
                step="any"
                value={expectedFood}
                onChange={(e) => setExpectedFood(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl py-2 px-3 text-slate-900 text-xs focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Valor Já Pago Inicialmente (R$)
            </label>
            <input
              type="number"
              step="any"
              value={paidAmount}
              onChange={(e) => setPaidAmount(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl py-2 px-3 text-slate-900 text-xs focus:border-emerald-500"
            />
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
              className="w-full bg-white border border-slate-300 rounded-xl py-2 px-3 text-slate-800 text-xs focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" /> Adicionar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
